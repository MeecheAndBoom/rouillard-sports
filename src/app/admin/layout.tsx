import Link from "next/link";
import { ToastProvider } from "@/components/ui/Toast";
import { getSession, destroySession } from "@/lib/auth";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/site/Logo";

/**
 * Admin chrome, race-control style: chequered strip, gold mark, numbered
 * section rail. English by design (the back office isn't translated); the
 * public site carries the FR/EN toggle. Login renders without the shell.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminGuard>
      {session ? (
        <ToastProvider>
          <div className="min-h-screen bg-pit">
            <header className="sticky top-0 z-40 border-b border-line bg-pit/95 backdrop-blur-md">
              <div aria-hidden="true" className="flag-band-sm h-[5px] w-full" />
              <div className="section flex h-14 items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <Link href="/admin" className="flex items-center gap-2.5">
                    <LogoMark size={28} />
                    <span className="font-display text-[18px] leading-none font-extrabold tracking-[0.02em] text-white">
                      Rouillard<span className="text-gold"> Sport</span>
                    </span>
                  </Link>
                  <span className="hidden border border-line px-2 py-1 font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-dim sm:block">
                    Race control
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/"
                    target="_blank"
                    className="btn btn-ghost btn-sm hidden sm:inline-flex"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true" />
                    <span>View site</span>
                  </Link>
                  <span className="hidden font-mono-num text-[12px] text-muted lg:block">
                    {session.email}
                  </span>
                  <form
                    action={async () => {
                      "use server";
                      await destroySession();
                    }}
                    className="m-0"
                  >
                    <button type="submit" className="btn btn-sm btn-ghost">
                      <i className="fa-solid fa-right-from-bracket text-[11px]" aria-hidden="true" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </div>
              </div>
            </header>

            <div className="section grid gap-8 pt-8 pb-20 lg:grid-cols-[228px_1fr] lg:gap-12">
              <aside className="h-fit border border-line lg:sticky lg:top-24">
                <AdminNav />
              </aside>
              <main className="flex min-w-0 flex-col gap-8">{children}</main>
            </div>
          </div>
        </ToastProvider>
      ) : (
        <>{children}</>
      )}
    </AdminGuard>
  );
}
