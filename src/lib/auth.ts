import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB, hasDatabase } from "./db";
import { Admin } from "./models/Admin";

const SESSION_COOKIE = "rs-admin";
const SESSION_DAYS = 7;

/**
 * Credentials come from env so the dashboard works before a database
 * exists. With MONGODB_URI set, the Admin collection wins and the env
 * pair acts as the bootstrap fallback.
 */
const envEmail = () =>
  (process.env.ADMIN_EMAIL ?? "admin@rouillard-sport.com").toLowerCase();
const envPassword = () => process.env.ADMIN_PASSWORD ?? "Rouillard2026!";

function secret() {
  const value =
    process.env.AUTH_SECRET ??
    "rs-dev-secret-change-me-in-production-0123456789abcdef";
  return new TextEncoder().encode(value);
}

export type Session = { email: string; name: string };

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<Session | null> {
  const normalized = email.trim().toLowerCase();

  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = (await Admin.findOne({ email: normalized }).lean()) as
        | { email: string; name?: string; passwordHash: string }
        | null;
      if (doc) {
        const bcrypt = (await import("bcryptjs")).default;
        if (await bcrypt.compare(password, doc.passwordHash)) {
          await Admin.updateOne(
            { email: normalized },
            { $set: { lastLoginAt: new Date() } },
          );
          return { email: doc.email, name: doc.name ?? "Admin" };
        }
        return null;
      }
    } catch {
      /* fall through to env credentials */
    }
  }

  if (normalized === envEmail() && password === envPassword()) {
    return { email: normalized, name: "Rouillard Sport" };
  }
  return null;
}

export async function createSession(email: string, name: string) {
  const token = await new SignJWT({ email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.email !== "string") return null;
    return {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "Admin",
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
