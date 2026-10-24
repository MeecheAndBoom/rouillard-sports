"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Client-side gate for /admin — the reference pattern (no middleware):
 * check the session, bounce to /admin/login when absent. Server actions
 * re-verify independently, so this is UX, not the security boundary.
 *
 * The login route is exempt: gating it would bounce an anonymous visitor
 * to the page it is already on and nothing would ever render.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "ok" | "deny">("loading");
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const gate = isLogin ? "ok" : state;

  useEffect(() => {
    if (isLogin) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await res.json()) as { email?: string };
        if (cancelled) return;
        if (data.email) {
          setState("ok");
        } else {
          setState("deny");
          router.replace("/admin/login");
        }
      } catch {
        if (!cancelled) {
          setState("deny");
          router.replace("/admin/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, isLogin]);

  if (gate === "loading") {
    return (
      <div className="section flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <i className="fa-solid fa-circle-notch animate-spin" aria-hidden="true" />
          <span className="text-[14px]">Chargement</span>
        </div>
      </div>
    );
  }

  if (gate !== "ok") return null;
  return <>{children}</>;
}
