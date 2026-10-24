import { connectDB, hasDatabase } from "./db";
import { readJson, writeJson } from "./fileStore";
import { Schema, model, models } from "mongoose";
import type { Enquiry } from "./types";

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

export type EnquiryRecord = Enquiry;

/** Enquiry submissions — DB-backed with the JSON store as fallback. */
const EnquirySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    kind: {
      type: String,
      enum: ["contact", "quote", "affiliate", "review", "part"],
      default: "contact",
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: String,
    handled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Enquiry = models.Enquiry ?? model("Enquiry", EnquirySchema);

export async function listEnquiries(): Promise<EnquiryRecord[]> {
  return fromDb(
    async () => {
      const docs = await Enquiry.find({}).sort({ createdAt: -1 }).lean();
      return (docs as unknown[]).map((d) => JSON.parse(JSON.stringify(d)) as EnquiryRecord);
    },
    () => readJson<EnquiryRecord[]>("enquiries", []),
  );
}

export async function addEnquiry(input: Omit<EnquiryRecord, "id" | "createdAt">): Promise<EnquiryRecord> {
  const id = `ENQ-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const record: EnquiryRecord = { ...input, id, createdAt: new Date().toISOString() };

  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Enquiry.create({ ...record });
      return JSON.parse(JSON.stringify(doc)) as EnquiryRecord;
    } catch {
      /* fall through */
    }
  }
  const enquiries = await readJson<EnquiryRecord[]>("enquiries", []);
  enquiries.unshift(record);
  await writeJson("enquiries", enquiries);
  return record;
}

export async function setEnquiryHandled(id: string, handled: boolean): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Enquiry.updateOne({ id }, { $set: { handled } });
      return Boolean(res.matchedCount);
    } catch {
      /* fall through */
    }
  }
  const enquiries = await readJson<EnquiryRecord[]>("enquiries", []);
  const match = enquiries.find((e) => e.id === id);
  if (!match) return false;
  match.handled = handled;
  await writeJson("enquiries", enquiries);
  return true;
}

export async function deleteEnquiry(id: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Enquiry.deleteOne({ id });
      return Boolean(res.deletedCount);
    } catch {
      /* fall through */
    }
  }
  const enquiries = await readJson<EnquiryRecord[]>("enquiries", []);
  const next = enquiries.filter((e) => e.id !== id);
  if (next.length === enquiries.length) return false;
  await writeJson("enquiries", next);
  return true;
}
