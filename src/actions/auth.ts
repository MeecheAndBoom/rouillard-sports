"use server";

import { z } from "zod";
import {
  createSession,
  destroySession,
  getSession,
  verifyCredentials,
} from "@/lib/auth";

const LoginSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(1, "Mot de passe obligatoire."),
});

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  const session = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!session) return { error: "Identifiants invalides." };

  await createSession(session.email, session.name);
  return null;
}

export async function logout(): Promise<void> {
  await destroySession();
}

export async function currentUser() {
  return getSession();
}
