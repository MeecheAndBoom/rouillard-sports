"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { addEnquiry } from "@/lib/enquiries";
import { addReview } from "@/lib/reviews";
import { notifyEnquiry } from "@/lib/notifications";
import { isLocale, type Locale } from "@/lib/i18n/config";

async function localeFromCookie(): Promise<Locale> {
  const raw = (await cookies()).get("rs-locale")?.value;
  return isLocale(raw) ? raw : "fr";
}

export type FormState = { ok?: boolean; error?: string } | null;

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Nom obligatoire."),
  email: z.email("Adresse e-mail invalide."),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court (10 caractères min.)."),
});

export async function submitContact(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = await localeFromCookie();
  const parsed = ContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        (locale === "fr" ? "Veuillez corriger les champs signalés." : "Please check the highlighted fields."),
    };
  }

  const enquiry = await addEnquiry({
    kind: "contact",
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || undefined,
    subject: parsed.data.subject || undefined,
    message: parsed.data.message,
    handled: false,
  });
  await notifyEnquiry(enquiry, locale);

  revalidatePath("/admin/enquiries");
  return { ok: true };
}

const QuoteSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  quoteRef: z.string().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Message trop court."),
});

export async function submitRetrieveQuote(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = await localeFromCookie();
  const parsed = QuoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        (locale === "fr" ? "Veuillez corriger les champs signalés." : "Please check the highlighted fields."),
    };
  }

  const enquiry = await addEnquiry({
    kind: "quote",
    name: parsed.data.quoteRef || parsed.data.email,
    email: parsed.data.email,
    subject: parsed.data.quoteRef
      ? `Devis ${parsed.data.quoteRef}`
      : "Demande de devis",
    message: parsed.data.message,
    handled: false,
  });
  await notifyEnquiry(enquiry, locale);

  revalidatePath("/admin/enquiries");
  return { ok: true };
}

const AffiliateSchema = z.object({
  name: z.string().trim().min(2, "Nom obligatoire."),
  email: z.email("Adresse e-mail invalide."),
  website: z.string().max(300).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Décrivez votre audience (10 caractères min.)."),
});

export async function submitAffiliate(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = await localeFromCookie();
  const parsed = AffiliateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        (locale === "fr" ? "Veuillez corriger les champs signalés." : "Please check the highlighted fields."),
    };
  }

  const enquiry = await addEnquiry({
    kind: "affiliate",
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.website || "Programme d’affiliation",
    message: parsed.data.message,
    handled: false,
  });
  await notifyEnquiry(enquiry, locale);

  revalidatePath("/admin/enquiries");
  return { ok: true };
}

const ReviewSchema = z.object({
  name: z.string().trim().min(2, "Nom obligatoire."),
  city: z.string().max(80).optional().or(z.literal("")),
  email: z.email("Adresse e-mail invalide."),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(150).optional().or(z.literal("")),
  body: z.string().trim().min(10, "Avis trop court (10 caractères min.)."),
  purchased: z.string().max(200).optional().or(z.literal("")),
});

export async function submitReview(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = ReviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  await addReview({
    name: parsed.data.name,
    city: parsed.data.city || undefined,
    email: parsed.data.email,
    rating: parsed.data.rating,
    title: parsed.data.title || undefined,
    body: parsed.data.body,
    purchased: parsed.data.purchased || undefined,
    date: new Date().toISOString().slice(0, 10),
    published: false,
  });

  revalidatePath("/admin/reviews");
  return { ok: true };
}
