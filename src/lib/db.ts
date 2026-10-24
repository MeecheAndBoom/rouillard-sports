import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB ?? "rouillard-sport";

/**
 * Resolves the database name to query.
 *
 * A MongoDB connection string without a path silently falls back to the
 * `test` database — that is how production ended up serving a stale catalog
 * while the real data sat in `rouillard-sport`. The path in the URI
 * wins when present, otherwise MONGODB_DB is used.
 *
 * Parsed by hand rather than with `new URL()`: credentials may contain
 * characters that are legal in a MongoDB URI but illegal in a URL.
 */
export function resolveDbName(uri: string): string {
  try {
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//i, "");
    const withoutQuery = withoutScheme.split("?")[0];
    const slash = withoutQuery.indexOf("/");
    if (slash === -1) return MONGODB_DB;
    const name = decodeURIComponent(withoutQuery.slice(slash + 1).split("/")[0]).trim();
    return name || MONGODB_DB;
  } catch {
    return MONGODB_DB;
  }
}

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  /** After a failed attempt, skip reconnecting for a short cool-down. */
  failedUntil: number;
};

const globalWithMongoose = global as typeof globalThis & { __mongoose?: Cached };
const cached: Cached = globalWithMongoose.__mongoose ?? {
  conn: null,
  promise: null,
  failedUntil: 0,
};
globalWithMongoose.__mongoose = cached;

export const hasDatabase = () => Boolean(MONGODB_URI);

/**
 * Opens a shared mongoose connection. Throws when MONGODB_URI is missing —
 * callers fall back to the local JSON stores so the storefront still renders.
 *
 * Timeouts are kept short (and failures cool down) so a slow or unreachable
 * cluster degrades to the seed catalog in ~2s instead of hanging every page
 * for mongoose's default 30s.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (cached.conn) return cached.conn;
  if (cached.failedUntil > Date.now()) {
    throw new Error("MongoDB recently unreachable, using local store");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: resolveDbName(MONGODB_URI),
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
      socketTimeoutMS: 10000,
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.failedUntil = Date.now() + 30_000;
    throw err;
  }
  return cached.conn;
}
