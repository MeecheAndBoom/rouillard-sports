import { connectDB, hasDatabase } from "./db";
import { Order } from "./models/Order";
import { Product } from "./models/Product";
import { readJson, writeJson } from "./fileStore";
import { getProducts, syncLocalStore } from "./products";
import type { OrderRecord, OrderStatusEvent } from "./types";
import type { OrderStatus } from "./constants";

const COOL_DOWN = 30_000;
let localFallbackUntil = 0;

async function fromDb<T>(query: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (hasDatabase() && Date.now() > localFallbackUntil) {
    try {
      await connectDB();
      return await query();
    } catch {
      localFallbackUntil = Date.now() + COOL_DOWN;
    }
  }
  return fallback();
}

const toRecord = (doc: unknown): OrderRecord => JSON.parse(JSON.stringify(doc)) as OrderRecord;

export async function listOrders(): Promise<OrderRecord[]> {
  return fromDb(
    async () => {
      const docs = await Order.find({}).sort({ createdAt: -1 }).lean();
      return (docs as unknown[]).map(toRecord);
    },
    () => readJson<OrderRecord[]>("orders", []),
  );
}

export async function findOrder(reference: string): Promise<OrderRecord | null> {
  const ref = reference.trim().toUpperCase();
  return fromDb(
    async () => {
      const doc = await Order.findOne({ reference: ref }).lean();
      return doc ? toRecord(doc) : null;
    },
    async () => {
      const orders = await readJson<OrderRecord[]>("orders", []);
      return orders.find((o) => o.reference === ref) ?? null;
    },
  );
}

/**
 * Strips the bank details from an order whose payment has already been
 * received.
 *
 * The UI hides the IBAN/BIC as soon as the payment lands, but an order that
 * reaches a client component is serialised into the page payload — without
 * this the details would still be readable in the page source. The admin
 * screens keep the full record (they need it to follow up on a transfer).
 */
export function redactPaymentDetails(order: OrderRecord): OrderRecord {
  const paid =
    order.payment.status === "received" || order.payment.proof?.decision === "approved";
  if (!paid) return order;
  return {
    ...order,
    payment: {
      ...order.payment,
      paymentDetails: undefined,
      instructions: undefined,
    },
  };
}

/**
 * Track-page lookup: the reference must match AND the email must belong to
 * the order — payment proofs and order details are gated by this pair.
 */
export async function findOrderForCustomer(
  reference: string,
  email: string,
): Promise<OrderRecord | null> {
  const order = await findOrder(reference);
  if (!order) return null;
  return order.customer.email.trim().toLowerCase() === email.trim().toLowerCase()
    ? order
    : null;
}

export function generateReference(): string {
  const block = () =>
    Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "0");
  return `RS-${block()}${block()}`;
}

/**
 * Refreshes data/orders.json from the database so the JSON fallback stays
 * current. Without this an order created while the database is reachable is
 * missing from the fallback, and a single Atlas hiccup right after checkout
 * makes the confirmation page render as if the order never existed.
 */
export async function syncOrderStore(): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await connectDB();
    const docs = await Order.find({}).sort({ createdAt: -1 }).lean();
    await writeJson("orders", (docs as unknown[]).map(toRecord));
  } catch {
    /* best effort */
  }
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Order.findOneAndUpdate(
        { reference: order.reference },
        { $set: order },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
      await Promise.all([syncLocalStore(), syncOrderStore()]);
      return toRecord(doc);
    } catch {
      /* fall through to local store */
    }
  }
  const orders = await readJson<OrderRecord[]>("orders", []);
  orders.unshift(order);
  await writeJson("orders", orders);
  return order;
}

export type OrderUpdate = Partial<{
  status: OrderStatus;
  adminNotes: string;
  "payment.method": string;
  "payment.methodOther": string;
  "payment.label": string;
  "payment.instructions": string;
  "payment.amountDue": number;
  "payment.dueDate": string;
  "payment.status": "pending" | "awaiting-proof" | "proof-submitted" | "received";
  "payment.receivedAt": string;
  "payment.requireProofUpload": boolean;
  "payment.proofMethod": "email" | "upload";
  "payment.paymentDetails": string;
  "payment.proof": OrderRecord["payment"]["proof"];
  "delivery.estimatedDate": string;
}>;

export async function updateOrder(
  reference: string,
  update: OrderUpdate,
  history?: OrderStatusEvent,
): Promise<OrderRecord | null> {
  const apply = (order: OrderRecord): OrderRecord => {
    const next: OrderRecord = { ...order };
    for (const [key, value] of Object.entries(update)) {
      if (value === undefined) continue;
      if (key.includes(".")) {
        const [group, field] = key.split(".") as [
          keyof OrderRecord,
          string,
        ];
        const sub = { ...(next[group] as Record<string, unknown>) } as never;
        (sub as Record<string, unknown>)[field] = value;
        (next as Record<string, unknown>)[group] = sub;
      } else {
        (next as Record<string, unknown>)[key] = value;
      }
    }
    if (history) next.statusHistory = [...(next.statusHistory ?? []), history];
    return next;
  };

  if (hasDatabase()) {
    try {
      await connectDB();
      const set: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(update)) {
        if (value !== undefined) set[key] = value;
      }
      const operations: Record<string, unknown> = { $set: set };
      if (history) operations.$push = { statusHistory: history };
      const doc = await Order.findOneAndUpdate({ reference }, operations, {
        new: true,
      }).lean();
      await Promise.all([syncLocalStore(), syncOrderStore()]);
      return doc ? toRecord(doc) : null;
    } catch {
      /* fall through */
    }
  }

  const orders = await readJson<OrderRecord[]>("orders", []);
  const idx = orders.findIndex((o) => o.reference === reference);
  if (idx < 0) return null;
  orders[idx] = apply(orders[idx]);
  await writeJson("orders", orders);
  return orders[idx];
}

export async function deleteOrder(reference: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Order.deleteOne({ reference });
      await Promise.all([syncLocalStore(), syncOrderStore()]);
      return Boolean(res.deletedCount);
    } catch {
      /* fall through */
    }
  }
  const orders = await readJson<OrderRecord[]>("orders", []);
  const next = orders.filter((o) => o.reference !== reference);
  if (next.length === orders.length) return false;
  await writeJson("orders", next);
  return true;
}

/** Decrements stock for each line — called once an order is confirmed. */
export async function decrementStock(items: { slug: string; qty: number }[]): Promise<void> {
  for (const item of items) {
    const product = (await getProducts({ includeDrafts: true })).find(
      (p) => p.slug === item.slug,
    );
    if (!product) continue;
    const stock = Math.max(0, product.stock - item.qty);
    if (hasDatabase()) {
      try {
        await connectDB();
        await Product.updateOne({ slug: item.slug }, { $set: { stock } });
      } catch {
        /* ignore */
      }
    }
    const local = await readJson<{ slug: string; stock: number }[] | null>("products", null);
    if (local) {
      const match = local.find((p) => p.slug === item.slug);
      if (match) match.stock = stock;
      await writeJson("products", local);
    }
  }
}
