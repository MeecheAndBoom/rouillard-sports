"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { deleteProduct, syncLocalStore, upsertProduct } from "@/lib/products";
import { deletePost, syncBlogStore, upsertPost } from "@/lib/blog";
import { deleteTile, upsertTile } from "@/lib/categories";
import { deleteReview, setReviewPublished } from "@/lib/reviews";
import { deleteEnquiry, setEnquiryHandled } from "@/lib/enquiries";
import { Settings } from "@/lib/models/Settings";
import { connectDB, hasDatabase } from "@/lib/db";
import { readJson, writeJson } from "@/lib/fileStore";
import { PAYMENT_METHODS, SITE } from "@/lib/constants";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { slugify } from "@/lib/fileStore";
import type { TaxonomyTile } from "@/lib/types";

export type AdminActionResult = { ok: boolean; error?: string };

async function requireAdmin(): Promise<AdminActionResult | null> {
  if (!(await getSession())) return { ok: false, error: "Non autorisé." };
  return null;
}

/* ── Products ─────────────────────────────────────────────────── */

const ProductSchema = z.object({
  slug: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Titre obligatoire (3 car. min.)."),
  titleEn: z.string().max(200).optional().or(z.literal("")),
  partNumber: z.string().trim().min(2, "Référence obligatoire."),
  sku: z.string().max(60).optional().or(z.literal("")),
  brand: z.string().trim().min(1, "Marque obligatoire."),
  make: z.string().trim().min(1, "Marque véhicule obligatoire."),
  model: z.string().trim().min(1, "Modèle obligatoire."),
  yearRange: z.string().max(40).optional().or(z.literal("")),
  fitment: z.string().max(1000).optional().or(z.literal("")),
  condition: z.enum(["new", "refurb", "used"]),
  category: z.string().trim().min(1, "Catégorie obligatoire."),
  subcategory: z.string().max(80).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Prix invalide."),
  listPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0),
  weightKg: z.coerce.number().min(0).optional(),
  description: z.string().trim().min(10, "Description obligatoire (10 car. min.)."),
  descriptionEn: z.string().max(6000).optional().or(z.literal("")),
  features: z.string().max(3000).optional().or(z.literal("")),
  images: z.string().max(4000).optional().or(z.literal("")),
  tags: z.string().max(1000).optional().or(z.literal("")),
  oemNumbers: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["live", "draft"]),
  featured: z.string().optional(),
});

const lines = (value?: string) =>
  (value ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

export async function saveProduct(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = ProductSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Champs invalides.",
    };
  }
  const d = parsed.data;

  const years = d.yearRange?.match(/(\d{4})\D+(\d{4})/);
  const record = await upsertProduct({
    ...(d.slug ? { slug: d.slug } : {}),
    title: d.title,
    titleEn: d.titleEn || undefined,
    partNumber: d.partNumber,
    sku: d.sku || undefined,
    brand: d.brand,
    make: d.make,
    model: d.model,
    yearRange: d.yearRange || undefined,
    yearFrom: years ? Number(years[1]) : undefined,
    yearTo: years ? Number(years[2]) : undefined,
    fitment: lines(d.fitment),
    condition: d.condition,
    category: d.category,
    subcategory: d.subcategory || undefined,
    price: d.price,
    listPrice: d.listPrice || undefined,
    stock: d.stock,
    weightKg: d.weightKg || undefined,
    specs: {},
    description: d.description,
    descriptionEn: d.descriptionEn || undefined,
    features: lines(d.features),
    images: lines(d.images),
    status: d.status,
    featured: Boolean(d.featured),
    tags: lines(d.tags),
    oemNumbers: lines(d.oemNumbers),
  });

  await syncLocalStore();
  revalidatePath("/shop");
  revalidatePath(`/shop/${record.slug}`);
  return { ok: true, error: undefined };
}

export async function deleteProductAction(slug: string): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await deleteProduct(slug);
  await syncLocalStore();
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  return { ok, error: ok ? undefined : "Pièce introuvable." };
}

/* ── Blog ─────────────────────────────────────────────────────── */

const PostSchema = z.object({
  slug: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Titre obligatoire."),
  titleEn: z.string().max(300).optional().or(z.literal("")),
  excerpt: z.string().trim().min(5, "Chapeau obligatoire."),
  excerptEn: z.string().max(500).optional().or(z.literal("")),
  category: z.string().trim().min(1, "Catégorie obligatoire."),
  tags: z.string().max(800).optional().or(z.literal("")),
  author: z.string().max(120).optional().or(z.literal("")),
  date: z.string().min(4, "Date obligatoire."),
  image: z.string().max(600).optional().or(z.literal("")),
  body: z.string().trim().min(40, "Contenu obligatoire (40 car. min.)."),
  bodyEn: z.string().max(60000).optional().or(z.literal("")),
  status: z.enum(["live", "draft"]),
  featured: z.string().optional(),
});

export async function savePost(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = PostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;

  const record = await upsertPost({
    ...(d.slug ? { slug: d.slug } : {}),
    title: d.title,
    titleEn: d.titleEn || undefined,
    excerpt: d.excerpt,
    excerptEn: d.excerptEn || undefined,
    category: d.category,
    tags: lines(d.tags),
    author: d.author || "Rouillard Sport",
    date: d.date,
    image: d.image || "",
    body: d.body,
    bodyEn: d.bodyEn || undefined,
    readMinutes: Math.max(1, Math.round(d.body.split(/\s+/).length / 200)),
    featured: Boolean(d.featured),
    status: d.status,
  });

  await syncBlogStore();
  revalidatePath("/blog");
  revalidatePath(`/blog/${record.slug}`);
  return { ok: true };
}

export async function deletePostAction(slug: string): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await deletePost(slug);
  await syncBlogStore();
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { ok, error: ok ? undefined : "Article introuvable." };
}

/* ── Taxonomy tiles ───────────────────────────────────────────── */

const TileSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Nom obligatoire."),
  type: z.enum(["category", "make", "brand", "model"]),
  image: z.string().max(600).optional().or(z.literal("")),
  href: z.string().max(300).optional().or(z.literal("")),
});

export async function saveTile(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = TileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;
  const tile: TaxonomyTile = {
    id: d.id || `${d.type}-${slugify(d.name)}`,
    name: d.name,
    type: d.type,
    image: d.image || "",
    href: d.href || undefined,
  };
  await upsertTile(tile);
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteTileAction(id: string): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await deleteTile(id);
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
  return { ok, error: ok ? undefined : "Élément introuvable." };
}

/* ── Reviews / enquiries moderation ───────────────────────────── */

export async function setReviewPublishedAction(
  date: string,
  published: boolean,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await setReviewPublished(date, published);
  revalidatePath("/admin/reviews");
  revalidatePath("/testimonials");
  return { ok, error: ok ? undefined : "Avis introuvable." };
}

export async function deleteReviewAction(date: string): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await deleteReview(date);
  revalidatePath("/admin/reviews");
  return { ok, error: ok ? undefined : "Avis introuvable." };
}

export async function setEnquiryHandledAction(
  id: string,
  handled: boolean,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await setEnquiryHandled(id, handled);
  revalidatePath("/admin/enquiries");
  return { ok, error: ok ? undefined : "Demande introuvable." };
}

export async function deleteEnquiryAction(id: string): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;
  const ok = await deleteEnquiry(id);
  revalidatePath("/admin/enquiries");
  return { ok, error: ok ? undefined : "Demande introuvable." };
}

/* ── Settings ─────────────────────────────────────────────────── */

const SettingsSchema = z.object({
  name: z.string().trim().min(2),
  tagline: z.string().max(200),
  taglineEn: z.string().max(200),
  location: z.string().max(120),
  address: z.string().max(300),
  phone: z.string().max(40),
  phoneHref: z.string().max(40),
  email: z.email(),
  announcement: z.string().max(300),
  fee: z.coerce.number().min(0),
  freeThreshold: z.coerce.number().min(0),
});

export async function saveSettings(
  _prev: AdminActionResult | null,
  formData: FormData,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (guard) return guard;

  const parsed = SettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const d = parsed.data;

  const hoursRaw = String(formData.get("hours") ?? "");
  const hours = hoursRaw
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts[0])
    .map((parts) => ({
      days: parts[0],
      daysEn: parts[1] ?? parts[0],
      time: parts[2] ?? "",
    }));

  // Payment methods: posted as method-<id>-label / -labelEn / -hint / -enabled.
  // Methods flagged for deletion (method-<id>-delete=on) are dropped entirely,
  // so an admin can remove a method even if it was previously saved in the DB.
  const paymentMethods = PAYMENT_METHODS.map((fallback) => ({
    id: fallback.id,
    label: String(formData.get(`method-${fallback.id}-label`) ?? fallback.label),
    labelEn: String(formData.get(`method-${fallback.id}-labelEn`) ?? fallback.labelEn),
    hint: String(formData.get(`method-${fallback.id}-hint`) ?? fallback.hint),
    hintEn: String(formData.get(`method-${fallback.id}-hintEn`) ?? fallback.hintEn),
    enabled: formData.get(`method-${fallback.id}-enabled`) === "on",
    sendEmailAfterOrder: formData.get(`method-${fallback.id}-sendEmail`) === "on",
    defaultPaymentDetails: String(formData.get(`method-${fallback.id}-paymentDetails`) ?? ""),
    defaultPaymentDetailsEn: String(formData.get(`method-${fallback.id}-paymentDetailsEn`) ?? ""),
  })).filter((m) => formData.get(`method-${m.id}-delete`) !== "on");

  const cloudinary = {
    cloudName: String(formData.get("cloudinaryCloudName") ?? "").trim(),
    apiKey: String(formData.get("cloudinaryApiKey") ?? "").trim(),
    apiSecret: String(formData.get("cloudinaryApiSecret") ?? "").trim(),
  };
  const smtp = {
    host: String(formData.get("smtpHost") ?? "").trim(),
    port: Number(formData.get("smtpPort") ?? 587),
    secure: formData.get("smtpSecure") === "on",
    user: String(formData.get("smtpUser") ?? "").trim(),
    pass: String(formData.get("smtpPass") ?? "").trim(),
    from: String(formData.get("smtpFrom") ?? "").trim(),
    notify: String(formData.get("smtpNotify") ?? "").trim(),
  };

  const payload = {
    site: {
      name: d.name,
      tagline: d.tagline,
      taglineEn: d.taglineEn,
      location: d.location,
      address: d.address,
      phone: d.phone,
      phoneHref: d.phoneHref,
      email: d.email,
      announcement: d.announcement,
      hours: hours.length ? hours : DEFAULT_SETTINGS.site.hours,
    },
    paymentMethods,
    delivery: { fee: d.fee, freeThreshold: d.freeThreshold },
    cloudinary,
    smtp,
  };

  if (hasDatabase()) {
    try {
      await connectDB();
      await Settings.findOneAndUpdate(
        { key: "site" },
        { $set: payload },
        { upsert: true, setDefaultsOnInsert: true },
      );
      await writeJson("settings", payload);
      revalidatePath("/", "layout");
      return { ok: true };
    } catch {
      /* fall through to JSON store */
    }
  }
  await writeJson("settings", payload);

  revalidatePath("/", "layout");
  return { ok: true, error: undefined };
}

/** Read settings snapshot for the admin form (env-first like getSettings). */
export async function readSettingsForAdmin() {
  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Settings.findOne({ key: "site" }).lean();
      if (doc) return JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
    } catch {
      /* fall through */
    }
  }
  return (await readJson<Record<string, unknown> | null>("settings", null)) ?? {
    site: DEFAULT_SETTINGS.site,
    paymentMethods: DEFAULT_SETTINGS.paymentMethods,
    delivery: DEFAULT_SETTINGS.delivery,
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: process.env.CLOUDINARY_API_KEY ?? "",
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    },
    smtp: {
      host: process.env.SMTP_HOST ?? "",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER ?? "",
      pass: "",
      from: process.env.EMAIL_FROM ?? "",
      notify: process.env.NOTIFICATION_EMAIL ?? SITE.email,
    },
  };
}
