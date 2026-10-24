import * as React from "react";

/** Shared form atoms: consistent label, hint and error treatment. */

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  optionalLabel,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? (
          <span className="text-gold" aria-hidden="true">
            {" *"}
          </span>
        ) : optionalLabel ? (
          <span className="ml-1.5 text-[11px] font-normal tracking-[0.04em] text-muted-dim normal-case">
            ({optionalLabel})
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-muted-dim">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Inline submit status: success or error, announced politely. */
export function FormMessage({
  state,
  success,
  error,
}: {
  state: { ok?: boolean; error?: string } | null;
  success: string;
  error: string;
}) {
  if (!state) return null;
  if (state.ok) {
    return (
      <p
        role="status"
        className="flex items-start gap-3 border border-success/45 bg-success/10 px-4 py-3 text-[14px] text-success"
      >
        <i className="fa-solid fa-check mt-0.5" aria-hidden="true" />
        <span>{success}</span>
      </p>
    );
  }
  if (state.error) {
    return (
      <p
        role="alert"
        className="flex items-start gap-3 border border-danger/45 bg-danger/10 px-4 py-3 text-[14px] text-danger"
      >
        <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
        <span>{state.error || error}</span>
      </p>
    );
  }
  return null;
}

/** Star row for reviews: display only, no interaction semantics. */
export function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`${star <= Math.round(rating) ? "fa-solid" : "fa-regular"} fa-star text-[11px] text-gold`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
