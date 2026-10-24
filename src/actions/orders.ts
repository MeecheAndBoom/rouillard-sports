"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  createOrder,
  decrementStock,
  findOrder,
  findOrderForCustomer,
  generateReference,
  redactPaymentDetails,
  updateOrder,
} from "@/lib/orders";
import {
  notifyOrderReceived,
  notifyPaymentConfirmed,
  notifyPaymentInstructions,
  notifyProofReceived,
  notifyProofRejected,
  notifyStatusUpdate,
} from "@/lib/notifications";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getSettings } from "@/lib/settings";
import { getProducts } from "@/lib/products";
import { ORDER_STATUSES } from "@/lib/constants";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import type { OrderRecord } from "@/lib/types";

/* ── Checkout ─────────────────────────────────────────────────── */

const CheckoutSchema = z.object({
  name: z.string().trim().min(2, "Nom obligatoire."),
  email: z.email("Adresse e-mail invalide."),
  phone: z.string().trim().min(6, "Numéro trop court.").optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  addressLine1: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  zip: z.string().max(20).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  paymentMethod: z.string().min(1, "Choisissez un mode de paiement."),
});

export type CheckoutResult =
  | { ok: true; reference: string }
  | { ok: false; error: string; field?: string };

export async function placeOrder(
  _prev: CheckoutResult | null,
  formData: FormData,
): Promise<CheckoutResult> {
  const parsed = CheckoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Veuillez corriger les champs signalés.",
      field: issue?.path[0]?.toString(),
    };
  }
  const data = parsed.data;

  // Cart lines come from the posted form (zustand persists client-side).
  const itemsRaw = String(formData.get("items") ?? "");
  let cartItems: { slug: string; qty: number }[] = [];
  try {
    cartItems = JSON.parse(itemsRaw) as { slug: string; qty: number }[];
  } catch {
    cartItems = [];
  }
  if (!cartItems.length) return { ok: false, error: "Votre panier est vide." };

  const products = await getProducts();
  const lines = cartItems
    .map((entry) => {
      const product = products.find((p) => p.slug === entry.slug);
      if (!product) return null;
      const qty = Math.max(1, Math.min(Number(entry.qty) || 1, product.stock || 1));
      return {
        slug: product.slug,
        title: product.title,
        image: product.images[0] ?? "",
        price: product.price,
        qty,
      };
    })
    .filter(Boolean) as OrderRecord["items"];

  if (!lines.length) return { ok: false, error: "Votre panier est vide." };

  const settings = await getSettings();
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const isDelivery = data.deliveryMethod === "delivery";
  const deliveryFee =
    isDelivery && subtotal < settings.delivery.freeThreshold
      ? settings.delivery.fee
      : 0;

  const methodSetting = settings.paymentMethods.find(
    (m) => m.id === data.paymentMethod && m.enabled,
  );
  if (!methodSetting) {
    return {
      ok: false,
      error: "Choisissez un mode de paiement disponible.",
      field: "paymentMethod",
    };
  }
  const localeRaw = (await cookies()).get("rs-locale")?.value;
  const lang: Locale = isLocale(localeRaw) ? localeRaw : "fr";

  const reference = generateReference();
  const now = new Date().toISOString();
  const t = dictionaries[lang];

  const useEmail = methodSetting.sendEmailAfterOrder !== false; // default true if not set
  const order: OrderRecord = {
    reference,
    lang,
    items: lines,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    customer: {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      notes: data.notes || undefined,
    },
    delivery: {
      method: data.deliveryMethod,
      address: isDelivery
        ? {
            line1: data.addressLine1 || undefined,
            city: data.city || undefined,
            state: data.state || undefined,
            zip: data.zip || undefined,
            country: data.country || undefined,
          }
        : undefined,
    },
    payment: {
      method: methodSetting.id,
      label:
        lang === "en"
          ? methodSetting.labelEn || methodSetting.label
          : methodSetting.label,
      status: useEmail ? "pending" : "awaiting-proof",
      proofMethod: useEmail ? "email" : "upload",
      requireProofUpload: !useEmail,
      // Always attach the method's stored payment details (localized) so the
      // instructions email — automatic or sent later from the dashboard —
      // never goes out empty.
      paymentDetails:
        lang === "en"
          ? methodSetting.defaultPaymentDetailsEn || methodSetting.defaultPaymentDetails
          : methodSetting.defaultPaymentDetails,
    },
    status: useEmail ? "Placed" : "Awaiting Payment Proof",
    statusHistory: [
      { status: useEmail ? "Placed" : "Awaiting Payment Proof", at: now, note: t.order.statuses[useEmail ? "Placed" : "Awaiting Payment Proof"] },
    ],
    createdAt: now,
  };

  await createOrder(order);
  await decrementStock(lines.map((l) => ({ slug: l.slug, qty: l.qty })));
  await notifyOrderReceived(order);

  return { ok: true, reference };
}

/* ── Payment proof (customer, authenticated by ref + email) ───── */

export type ProofState = { ok?: boolean; error?: string } | null;

const MAX_PROOF_BYTES = 10 * 1024 * 1024;
const PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

/**
 * Track-page proof upload. Auth is the (reference, email) pair — no
 * session — and the order must be in a state that accepts proof.
 */
export async function submitPaymentProof(
  reference: string,
  email: string,
  formData: FormData,
): Promise<ProofState> {
  const order = await findOrderForCustomer(reference, email);
  if (!order) return { error: "Commande introuvable ou e-mail incorrect." };

  const accepting =
    order.payment.proofMethod === "upload" &&
    ["awaiting-proof", "proof-submitted"].includes(order.payment.status ?? "pending");

  if (!accepting) {
    return { error: "Cette commande n’accepte pas de preuve pour le moment." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionnez une image (JPG, PNG ou WebP, 10 Mo max)." };
  }
  if (file.size > MAX_PROOF_BYTES) {
    return { error: "Fichier trop volumineux (10 Mo maximum)." };
  }
  if (!PROOF_TYPES.includes(file.type)) {
    return { error: "Format non accepté, utilisez JPG, PNG ou WebP." };
  }

  const note = String(formData.get("note") ?? "").slice(0, 500);
  const folder = `rouillard/uploads/payments/${order.reference}`;
  const now = new Date().toISOString();

  let url: string;
  let publicId: string | undefined;
  try {
    const uploaded = await uploadToCloudinary(file, folder);
    if (!uploaded) {
      // No Cloudinary configured — stage the file locally so the flow
      // still completes (admin sees it against the order).
      const bytes = Buffer.from(await file.arrayBuffer());
      const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "data", "proofs", order.reference);
      await fs.mkdir(dir, { recursive: true });
      const name = `proof-${Date.now()}.${ext}`;
      await fs.writeFile(path.join(dir, name), bytes);
      url = `/api/proofs/${order.reference}/${name}`;
      publicId = name;
    } else {
      url = uploaded.url;
      publicId = uploaded.publicId;
    }
  } catch {
    return { error: "Échec de l’envoi. Réessayez dans un instant." };
  }

  const updated = await updateOrder(
    order.reference,
    {
      status: "Payment Proof Submitted",
      "payment.status": "proof-submitted",
      "payment.proof": {
        url,
        publicId,
        uploadedAt: now,
        uploadedBy: order.customer.email,
        note: note || undefined,
      },
    },
    {
      status: "Payment Proof Submitted",
      at: now,
      note: dictionaries[order.lang ?? "fr"].order.statuses["Payment Proof Submitted"],
    },
  );
  if (updated) await notifyProofReceived(updated);

  revalidatePath("/track");
  return { ok: true };
}

/* ── Admin: payment proof review + status flow ────────────────── */

async function requireAdmin(): Promise<boolean> {
  const { getSession } = await import("@/lib/auth");
  return Boolean(await getSession());
}

export type AdminOrderResult = { ok: boolean; error?: string };

export async function reviewPaymentProof(input: {
  reference: string;
  decision: "approved" | "rejected";
  note?: string;
}): Promise<AdminOrderResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };

  const order = await findOrder(input.reference);
  if (!order) return { ok: false, error: "Commande introuvable." };

  const now = new Date().toISOString();
  const proof = order.payment.proof
    ? {
        ...order.payment.proof,
        decision: input.decision,
        decisionNote: input.note?.slice(0, 500) || undefined,
        decidedAt: now,
      }
    : undefined;

  if (input.decision === "approved") {
    const updated = await updateOrder(
      order.reference,
      {
        status: "Payment Received",
        "payment.status": "received",
        "payment.receivedAt": now,
        "payment.proof": proof,
      },
      {
        status: "Payment Received",
        at: now,
        note: dictionaries[order.lang ?? "fr"].order.statuses["Payment Received"],
      },
    );
    if (updated) await notifyPaymentConfirmed(updated);
  } else {
    const updated = await updateOrder(
      order.reference,
      {
        status: "Awaiting Payment Proof",
        "payment.status": "awaiting-proof",
        "payment.proof": proof,
      },
      {
        status: "Awaiting Payment Proof",
        at: now,
        note: dictionaries[order.lang ?? "fr"].order.statuses["Awaiting Payment Proof"],
      },
    );
    if (updated) await notifyProofRejected(updated);
  }

  revalidatePath(`/admin/orders/${order.reference}`);
  revalidatePath("/track");
  return { ok: true };
}

const StatusSchema = z.object({
  reference: z.string().min(4),
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(1000).optional().or(z.literal("")),
  paymentStatus: z
    .enum(["pending", "awaiting-proof", "proof-submitted", "received"])
    .optional(),
  amountDue: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional().or(z.literal("")),
  proofMethod: z.enum(["email", "upload"]).optional(),
  paymentDetails: z.string().max(4000).optional().or(z.literal("")),
  instructions: z.string().max(4000).optional().or(z.literal("")),
  adminNotes: z.string().max(4000).optional().or(z.literal("")),
});

export async function updateOrderStatus(
  _prev: AdminOrderResult | null,
  formData: FormData,
): Promise<AdminOrderResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };

  const parsed = StatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;

  const order = await findOrder(data.reference);
  if (!order) return { ok: false, error: "Commande introuvable." };

  const now = new Date().toISOString();
  const statusChanged = order.status !== data.status;
  const t = dictionaries[order.lang ?? "fr"];

  const update: Parameters<typeof updateOrder>[1] = {
    status: data.status,
  };
  if (data.adminNotes !== undefined) update.adminNotes = data.adminNotes;
  if (data.paymentStatus) update["payment.status"] = data.paymentStatus;
  if (data.amountDue !== undefined) update["payment.amountDue"] = data.amountDue;
  if (data.dueDate) update["payment.dueDate"] = data.dueDate;
  if (data.proofMethod) update["payment.proofMethod"] = data.proofMethod;
  if (data.paymentDetails !== undefined)
    update["payment.paymentDetails"] = data.paymentDetails;
  if (data.instructions !== undefined) update["payment.instructions"] = data.instructions;
  if (data.paymentStatus === "received") {
    update["payment.receivedAt"] = order.payment.receivedAt ?? now;
  }

  const updated = await updateOrder(
    data.reference,
    update,
    statusChanged
      ? { status: data.status, at: now, note: data.note || undefined }
      : undefined,
  );
  if (!updated) return { ok: false, error: "Commande introuvable." };

  if (statusChanged) {
    await notifyStatusUpdate(updated, t.order.statuses[data.status] ?? data.status, data.note);
  }

  revalidatePath(`/admin/orders/${data.reference}`);
  revalidatePath("/admin/orders");
  revalidatePath("/track");
  return { ok: true };
}

/** Sends the payment instructions email from the order detail screen. */
export async function sendPaymentInstructions(reference: string): Promise<AdminOrderResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };

  const order = await findOrder(reference);
  if (!order) return { ok: false, error: "Commande introuvable." };

  // Backfill payment details from settings if the order carries none (e.g.
  // placed before the admin filled them in) so the email is never empty.
  let orderToSend = order;
  if (!order.payment.paymentDetails && !order.payment.instructions) {
    const settings = await getSettings();
    const method = settings.paymentMethods.find((m) => m.id === order.payment.method);
    const details =
      method && order.lang === "en"
        ? method.defaultPaymentDetailsEn || method.defaultPaymentDetails
        : method?.defaultPaymentDetails;
    if (details) {
      const backfilled = await updateOrder(order.reference, {
        "payment.paymentDetails": details,
      });
      if (backfilled) orderToSend = backfilled;
    }
  }

  const now = new Date().toISOString();
  // Sending payment instructions means the buyer now has the details and must
  // send back a proof — switch the order to the upload track so the customer
  // can submit their screenshot on the Track Order page.
  const updated = await updateOrder(
    orderToSend.reference,
    {
      status: "Awaiting Payment Proof",
      "payment.status": "awaiting-proof",
      "payment.proofMethod": "upload",
    },
    {
      status: "Awaiting Payment Proof",
      at: now,
      note: dictionaries[order.lang ?? "fr"].order.statuses["Awaiting Payment Proof"],
    },
  );
  if (!updated) return { ok: false, error: "Commande introuvable." };

  const result = await notifyPaymentInstructions(updated);
  revalidatePath(`/admin/orders/${reference}`);
  return {
    ok: result.ok,
    error: result.ok ? undefined : "SMTP non configuré, e-mail enregistré localement.",
  };
}

export async function deleteOrderAction(reference: string): Promise<AdminOrderResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Non autorisé." };
  const { deleteOrder } = await import("@/lib/orders");
  const ok = await deleteOrder(reference);
  revalidatePath("/admin/orders");
  return { ok, error: ok ? undefined : "Commande introuvable." };
}

/* ── Customer lookup (Track page) ─────────────────────────────── */

export type LookupResult =
  | { ok: true; order: OrderRecord }
  | { ok: false; errorKey: "errorMissing" | "errorNoMatch" };

/**
 * Reference + email pair lookup — the Track page gate (§7). Returns an error
 * key rather than a string so the client renders it in the active locale.
 */
export async function lookupOrder(
  reference: string,
  email: string,
): Promise<LookupResult> {
  const ref = reference.trim().toUpperCase();
  const mail = email.trim().toLowerCase();
  if (!ref || !mail) return { ok: false, errorKey: "errorMissing" };
  const order = await findOrderForCustomer(ref, mail);
  if (!order) return { ok: false, errorKey: "errorNoMatch" };
  // The response travels to the browser — drop the bank details once the
  // payment has landed so they cannot be read out of the page payload.
  return { ok: true, order: redactPaymentDetails(order) };
}
