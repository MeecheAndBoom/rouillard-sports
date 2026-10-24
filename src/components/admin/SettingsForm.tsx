"use client";

import { useActionState } from "react";
import { saveSettings, type AdminActionResult } from "@/actions/admin";
import type { SiteSettings } from "@/lib/settings";

/**
 * Site settings editor: identity, hours, payment methods (FR + EN labels),
 * delivery pricing. Secrets stay in the environment, so the Cloudinary and
 * SMTP blocks here are read-only status.
 */
export function SettingsForm({
  settings,
  cloudinaryConfigured,
  smtpConfigured,
}: {
  settings: SiteSettings;
  cloudinaryConfigured: boolean;
  smtpConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveSettings,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {/* ── Identity ─────────────────────────────────────── */}
      <Section title="Site identity" icon="fa-id-card">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Name" name="name" defaultValue={settings.site.name} required />
          <Input label="Location" name="location" defaultValue={settings.site.location} />
          <Input
            label="Tagline (FR)"
            name="tagline"
            defaultValue={settings.site.tagline}
            className="sm:col-span-2"
          />
          <Input
            label="Tagline (EN)"
            name="taglineEn"
            defaultValue={settings.site.taglineEn}
            className="sm:col-span-2"
          />
          <Input
            label="Address"
            name="address"
            defaultValue={settings.site.address}
            className="sm:col-span-2"
          />
          <Input label="Phone" name="phone" defaultValue={settings.site.phone} />
          <Input
            label="Phone (tel link)"
            name="phoneHref"
            defaultValue={settings.site.phoneHref}
          />
          <Input
            label="Contact email"
            name="email"
            type="email"
            defaultValue={settings.site.email}
            required
          />
          <Input
            label="Announcement bar"
            name="announcement"
            defaultValue={settings.site.announcement}
            hint="Leave empty to hide the bar."
          />
        </div>

        <div className="mt-5">
          <label htmlFor="s-hours" className="field-label">
            Opening hours, one row per line
          </label>
          <textarea
            id="s-hours"
            name="hours"
            rows={5}
            defaultValue={settings.site.hours
              .map((row) => `${row.days} | ${row.daysEn} | ${row.time}`)
              .join("\n")}
            className="field resize-y font-mono-num text-[13.5px]"
          />
          <p className="mt-1.5 text-[13px] text-muted">
            Each row reads FR days | EN days | time.
          </p>
        </div>
      </Section>

      {/* ── Payment methods ──────────────────────────────── */}
      <Section title="Payment methods" icon="fa-credit-card">
        <p className="text-[14px] text-muted">
          Labels appear on checkout (FR + EN) and drive the instructions email.
        </p>

        <div className="mt-5 flex flex-col gap-6">
          {settings.paymentMethods.map((method) => (
            <fieldset
              key={method.id}
              className="grid gap-4 border-t border-line pt-5 first:border-0 first:pt-0 sm:grid-cols-2"
            >
              <legend className="sr-only">{method.label}</legend>
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                <span className="badge border-line bg-panel-2 font-mono-num text-muted">
                  {method.id}
                </span>
                <label className="flex cursor-pointer items-center gap-2 text-[14.5px] text-paper">
                  <input
                    type="checkbox"
                    name={`method-${method.id}-enabled`}
                    defaultChecked={method.enabled}
                    className="h-4 w-4 accent-[var(--color-gold)]"
                  />
                  Enabled
                </label>
              </div>
              <Input
                label="Label (FR)"
                name={`method-${method.id}-label`}
                defaultValue={method.label}
              />
              <Input
                label="Label (EN)"
                name={`method-${method.id}-labelEn`}
                defaultValue={method.labelEn}
              />
              <Input
                label="Hint (FR)"
                name={`method-${method.id}-hint`}
                defaultValue={method.hint}
              />
              <Input
                label="Hint (EN)"
                name={`method-${method.id}-hintEn`}
                defaultValue={method.hintEn}
              />
              <div className="flex items-center gap-2.5 pt-1 sm:col-span-2">
                <input
                  type="checkbox"
                  id={`method-${method.id}-sendEmail`}
                  name={`method-${method.id}-sendEmail`}
                  defaultChecked={method.sendEmailAfterOrder !== false}
                  className="h-4 w-4 accent-[var(--color-gold)]"
                />
                <label htmlFor={`method-${method.id}-sendEmail`} className="text-[14.5px] text-paper">
                  Send payment instructions by email after order
                </label>
              </div>
              <div className="flex items-center gap-2.5 pt-1 sm:col-span-2">
                <input
                  type="checkbox"
                  id={`method-${method.id}-delete`}
                  name={`method-${method.id}-delete`}
                  className="h-4 w-4 accent-[var(--color-danger)]"
                />
                <label htmlFor={`method-${method.id}-delete`} className="text-[14.5px] text-danger">
                  Delete this payment method
                </label>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`s-method-${method.id}-paymentDetails`} className="field-label">
                  Default payment details (FR)
                </label>
                <textarea
                  id={`s-method-${method.id}-paymentDetails`}
                  name={`method-${method.id}-paymentDetails`}
                  rows={4}
                  defaultValue={method.defaultPaymentDetails ?? ""}
                  placeholder={"e.g.\nIBAN FR76 3000 4000 0312 3456 7890 189\nBIC BNPAFRPPXXX\nHolder: Rouillard Sport"}
                  className="field resize-y font-mono-num text-[13.5px]"
                />
                <p className="mt-1.5 text-[13px] text-muted">
                  IBAN, BIC or a transfer reference. Sent in the instructions email.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor={`s-method-${method.id}-paymentDetailsEn`} className="field-label">
                  Default payment details (EN)
                </label>
                <textarea
                  id={`s-method-${method.id}-paymentDetailsEn`}
                  name={`method-${method.id}-paymentDetailsEn`}
                  rows={4}
                  defaultValue={method.defaultPaymentDetailsEn ?? ""}
                  placeholder={"e.g.\nIBAN FR76 3000 4000 0312 3456 7890 189\nBIC BNPAFRPPXXX\nAccount holder: Rouillard Sport"}
                  className="field resize-y font-mono-num text-[13.5px]"
                />
              </div>
            </fieldset>
          ))}
        </div>
      </Section>

      {/* ── Delivery ─────────────────────────────────────── */}
      <Section title="Delivery" icon="fa-truck-fast">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Delivery fee (EUR)"
            name="fee"
            type="number"
            step="0.01"
            min={0}
            defaultValue={String(settings.delivery.fee)}
            required
          />
          <Input
            label="Free delivery from (EUR)"
            name="freeThreshold"
            type="number"
            step="0.01"
            min={0}
            defaultValue={String(settings.delivery.freeThreshold)}
            required
          />
        </div>
      </Section>

      {/* ── Integrations (env-driven, read-only) ─────────── */}
      <Section title="Integrations" icon="fa-plug">
        <p className="text-[14px] text-muted">
          Managed in <span className="font-mono-num">.env.local</span>. The environment always
          wins over stored settings.
        </p>
        <ul className="mt-4 flex flex-col gap-3 text-[14.5px]">
          <li className="flex flex-wrap items-center gap-3 border-b border-line-soft pb-3">
            <StatusFlag ok={cloudinaryConfigured} />
            <span className="font-medium text-paper">Cloudinary</span>
            <span className="text-muted">
              {cloudinaryConfigured
                ? "Configured, part and proof uploads enabled."
                : "Not configured, uploads fall back to local storage."}
            </span>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <StatusFlag ok={smtpConfigured} />
            <span className="font-medium text-paper">SMTP (emails)</span>
            <span className="text-muted">
              {smtpConfigured
                ? "Configured, order and notification emails send live."
                : "Not configured, emails are written to data/emails for inspection."}
            </span>
          </li>
        </ul>
      </Section>

      {/* ── Submit ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? (
            <i className="fa-solid fa-circle-notch animate-spin text-[12px]" aria-hidden="true" />
          ) : (
            <i className="fa-solid fa-floppy-disk text-[12px]" aria-hidden="true" />
          )}
          <span>{pending ? "Saving" : "Save settings"}</span>
        </button>
        {state && !state.ok ? (
          <span role="alert" className="text-[14px] text-danger">
            {state.error}
          </span>
        ) : null}
        {state?.ok ? (
          <span className="flex items-center gap-2 text-[14px] text-success">
            <i className="fa-solid fa-circle-check text-[12px]" aria-hidden="true" />
            Settings saved.
          </span>
        ) : null}
      </div>
    </form>
  );
}

/* ── Small atoms ─────────────────────────────────────────────── */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-panel p-6 sm:p-8">
      <h2 className="flex items-center gap-2.5 border-b border-line pb-4 font-display text-[20px] leading-none text-white">
        <i className={`fa-solid ${icon} text-[14px] text-gold`} aria-hidden="true" />
        {title}
      </h2>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function Input({
  label,
  name,
  className = "",
  hint,
  ...rest
}: {
  label: string;
  name: string;
  className?: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `s-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} name={name} className="field" {...rest} />
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

function StatusFlag({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`h-3 w-3 shrink-0 border ${ok ? "border-success bg-success" : "border-muted-dim bg-transparent"}`}
    />
  );
}
