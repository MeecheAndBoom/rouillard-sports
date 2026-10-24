import { connectDB, hasDatabase } from "./db";
import { Review } from "./models/Review";
import { SEED_REVIEWS } from "./catalog";
import { readJson, writeJson } from "./fileStore";
import type { Review as ReviewRecord } from "./types";

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

const toRecord = (doc: unknown): ReviewRecord => JSON.parse(JSON.stringify(doc)) as ReviewRecord;

export async function getReviews(opts?: {
  includeUnpublished?: boolean;
}): Promise<ReviewRecord[]> {
  return fromDb(
    async () => {
      const docs = await Review.find(opts?.includeUnpublished ? {} : { published: true })
        .sort({ date: -1 })
        .lean();
      return (docs as unknown[]).map(toRecord);
    },
    async () => {
      const local = await readJson<ReviewRecord[] | null>("reviews", null);
      const base = local && local.length ? local : SEED_REVIEWS;
      return opts?.includeUnpublished ? base : base.filter((r) => r.published);
    },
  );
}

export async function addReview(review: ReviewRecord): Promise<ReviewRecord> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Review.create(review);
      return toRecord(doc);
    } catch {
      /* fall through */
    }
  }
  const reviews = await readJson<ReviewRecord[]>("reviews", [...SEED_REVIEWS]);
  reviews.unshift(review);
  await writeJson("reviews", reviews);
  return review;
}

export async function setReviewPublished(date: string, published: boolean): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Review.updateOne({ date }, { $set: { published } });
      return Boolean(res.matchedCount);
    } catch {
      /* fall through */
    }
  }
  const reviews = await readJson<ReviewRecord[]>("reviews", [...SEED_REVIEWS]);
  const match = reviews.find((r) => r.date === date && r.name);
  if (!match) return false;
  match.published = published;
  await writeJson("reviews", reviews);
  return true;
}

export async function deleteReview(date: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Review.deleteOne({ date });
      return Boolean(res.deletedCount);
    } catch {
      /* fall through */
    }
  }
  const reviews = await readJson<ReviewRecord[]>("reviews", [...SEED_REVIEWS]);
  const next = reviews.filter((r) => r.date !== date);
  if (next.length === reviews.length) return false;
  await writeJson("reviews", next);
  return true;
}

export function averageRating(reviews: ReviewRecord[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
