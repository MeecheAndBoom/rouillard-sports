"use client";

import { useActionState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  submitAffiliate,
  submitContact,
  submitRetrieveQuote,
  submitReview,
  type FormState,
} from "@/actions/forms";
import { Field, FormMessage, Stars } from "@/components/ui/FormBits";
import { useState } from "react";

/**
 * Public forms — contact, quote, affiliate and review.
 *
 * Shared look: a workshop job card. A gold rule and a machined icon square
 * open the sheet, the fields sit in hairline-separated groups, and the
 * submit bar is pinned to the bottom edge.
 */

/** Gold rule + icon square: the header of every public form sheet. */
function SheetHeader({ icon }: { icon: string }) {
  return (
    <div aria-hidden="true" className="flex items-center gap-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center border border-gold text-[15px] text-gold">
        <i className={`fa-solid ${icon}`} />
      </span>
      <span className="rule-gold flex-1" />
    </div>
  );
}

/** Submit bar: hairline above, primary action on the left. */
function SubmitBar({
  pending,
  icon,
  label,
}: {
  pending: boolean;
  icon: string;
  label: string;
}) {
  return (
    <div className="border-t border-line pt-6">
      <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
        {pending ? (
          <i
            className="fa-solid fa-circle-notch animate-spin text-[13px]"
            aria-hidden="true"
          />
        ) : (
          <i className={`fa-solid ${icon} text-[12px]`} aria-hidden="true" />
        )}
        <span>{label}</span>
      </button>
    </div>
  );
}

/* ── Contact ──────────────────────────────────────────────────── */

export function ContactForm({ defaultSubject }: { defaultSubject?: string }) {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitContact,
    null,
  );

  if (state?.ok) {
    return <FormMessage state={state} success={t.contact.success} error={t.common.error} />;
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <SheetHeader icon="fa-paper-plane" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.contact.name} htmlFor="c-name" required>
          <input
            id="c-name"
            name="name"
            required
            autoComplete="name"
            className="field"
          />
        </Field>
        <Field label={t.contact.email} htmlFor="c-email" required>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </Field>
      </div>

      <div className="grid gap-5 border-t border-line-soft pt-6 sm:grid-cols-2">
        <Field label={t.contact.phone} htmlFor="c-phone" optionalLabel={t.common.optional}>
          <input
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="field"
          />
        </Field>
        <Field label={t.contact.subject} htmlFor="c-subject" optionalLabel={t.common.optional}>
          <input
            id="c-subject"
            name="subject"
            className="field"
            placeholder={t.contact.subjectPlaceholder}
            defaultValue={defaultSubject}
          />
        </Field>
      </div>

      <Field label={t.contact.message} htmlFor="c-message" required>
        <textarea
          id="c-message"
          name="message"
          rows={6}
          required
          placeholder={t.contact.messagePlaceholder}
          className="field resize-y"
        />
      </Field>

      <FormMessage state={state} success={t.contact.success} error={t.common.error} />

      <SubmitBar pending={pending} icon="fa-paper-plane" label={t.contact.send} />
    </form>
  );
}

/* ── Retrieve quote ───────────────────────────────────────────── */

export function QuoteForm() {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitRetrieveQuote,
    null,
  );

  if (state?.ok) {
    return <FormMessage state={state} success={t.retrieveQuote.success} error={t.common.error} />;
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <SheetHeader icon="fa-magnifying-glass" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.retrieveQuote.email} htmlFor="q-email" required>
          <input
            id="q-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </Field>
        <Field label={t.retrieveQuote.quoteRef} htmlFor="q-ref" optionalLabel={t.common.optional}>
          <input
            id="q-ref"
            name="quoteRef"
            className="field font-mono-num uppercase tracking-[0.1em]"
            placeholder={t.retrieveQuote.quoteRefPlaceholder}
          />
        </Field>
      </div>

      <div className="border-t border-line-soft pt-6">
        <Field label={t.retrieveQuote.message} htmlFor="q-message" required>
          <textarea
            id="q-message"
            name="message"
            rows={5}
            required
            placeholder={t.retrieveQuote.messagePlaceholder}
            className="field resize-y"
          />
        </Field>
      </div>

      <FormMessage
        state={state}
        success={t.retrieveQuote.success}
        error={t.common.error}
      />

      <SubmitBar pending={pending} icon="fa-magnifying-glass" label={t.retrieveQuote.submit} />
    </form>
  );
}

/* ── Affiliate ────────────────────────────────────────────────── */

export function AffiliateForm() {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitAffiliate,
    null,
  );

  if (state?.ok) {
    return <FormMessage state={state} success={t.affiliate.success} error={t.common.error} />;
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <SheetHeader icon="fa-handshake" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.affiliate.name} htmlFor="a-name" required>
          <input
            id="a-name"
            name="name"
            required
            autoComplete="name"
            className="field"
          />
        </Field>
        <Field label={t.affiliate.email} htmlFor="a-email" required>
          <input
            id="a-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </Field>
      </div>

      <div className="border-t border-line-soft pt-6">
        <Field label={t.affiliate.website} htmlFor="a-site" optionalLabel={t.common.optional}>
          <input
            id="a-site"
            name="website"
            type="url"
            className="field"
            placeholder="https://"
          />
        </Field>
      </div>

      <Field label={t.affiliate.message} htmlFor="a-message" required>
        <textarea
          id="a-message"
          name="message"
          rows={5}
          required
          className="field resize-y"
        />
      </Field>

      <FormMessage state={state} success={t.affiliate.success} error={t.common.error} />

      <SubmitBar pending={pending} icon="fa-handshake" label={t.affiliate.send} />
    </form>
  );
}

/* ── Review ───────────────────────────────────────────────────── */

export function ReviewForm() {
  const { t } = useLocale();
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitReview,
    null,
  );
  const [rating, setRating] = useState(5);

  if (state?.ok) {
    return <FormMessage state={state} success={t.testimonials.success} error={t.common.error} />;
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <SheetHeader icon="fa-star" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.testimonials.name} htmlFor="r-name" required>
          <input
            id="r-name"
            name="name"
            required
            autoComplete="name"
            className="field"
          />
        </Field>
        <Field label={t.testimonials.city} htmlFor="r-city" optionalLabel={t.common.optional}>
          <input id="r-city" name="city" className="field" />
        </Field>
      </div>

      <div className="border-t border-line-soft pt-6">
        <Field label={t.testimonials.email} htmlFor="r-email" required>
          <input
            id="r-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </Field>
      </div>

      <fieldset className="border-t border-line-soft pt-6">
        <legend className="field-label">{t.testimonials.rating}</legend>
        <input type="hidden" name="rating" value={rating} />
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star}/5`}
              className="grid h-10 w-10 place-items-center border border-line bg-pit transition-colors duration-150 hover:border-gold active:scale-95"
            >
              <i
                className={`${star <= rating ? "fa-solid" : "fa-regular"} fa-star text-[17px] text-gold`}
                aria-hidden="true"
              />
            </button>
          ))}
          <span className="ml-2 text-[13px] text-muted">
            <Stars rating={rating} />
          </span>
        </div>
      </fieldset>

      <div className="border-t border-line-soft pt-6">
        <Field label={t.testimonials.reviewTitle} htmlFor="r-title" optionalLabel={t.common.optional}>
          <input id="r-title" name="title" className="field" />
        </Field>
      </div>

      <Field label={t.testimonials.body} htmlFor="r-body" required>
        <textarea
          id="r-body"
          name="body"
          rows={5}
          required
          placeholder={t.testimonials.bodyPlaceholder}
          className="field resize-y"
        />
      </Field>

      <div className="border-t border-line-soft pt-6">
        <Field label={t.testimonials.purchased} htmlFor="r-purchased" optionalLabel={t.common.optional}>
          <input id="r-purchased" name="purchased" className="field" />
        </Field>
      </div>

      <FormMessage
        state={state}
        success={t.testimonials.success}
        error={t.common.error}
      />

      <SubmitBar pending={pending} icon="fa-star" label={t.testimonials.submit} />
    </form>
  );
}
