"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <div className="relative">
          <i
            className="fa-solid fa-envelope pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[13px] text-muted-dim"
            aria-hidden="true"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="field pl-11"
            placeholder="contact@rouillard-sport.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <i
            className="fa-solid fa-lock pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[13px] text-muted-dim"
            aria-hidden="true"
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field pl-11"
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="flex items-start gap-2.5 bg-danger/10 px-4 py-3 text-[14px] text-danger"
        >
          <i className="fa-solid fa-circle-exclamation mt-0.5 text-[13px]" aria-hidden="true" />
          <span>{state.error}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-lg w-full"
      >
        {pending ? (
          <i className="fa-solid fa-circle-notch animate-spin text-[12px]" aria-hidden="true" />
        ) : (
          <i className="fa-solid fa-right-to-bracket text-[12px]" aria-hidden="true" />
        )}
        <span>{pending ? "Signing in" : "Sign in"}</span>
      </button>
    </form>
  );
}
