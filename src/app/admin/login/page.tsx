import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo, LogoMark } from "@/components/site/Logo";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

const CAPABILITIES = [
  { icon: "fa-bag-shopping", text: "Live order and payment-proof queue" },
  { icon: "fa-gears", text: "Parts inventory with stock alerts" },
  { icon: "fa-newspaper", text: "Blog, guides and category tiles" },
];

/**
 * Sign-in screen. The brand panel carries the chequered band and the
 * workshop manifest, the form panel is a single centred sheet.
 */
export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left: brand panel */}
      <section className="relative hidden overflow-hidden border-r border-line bg-asphalt lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
        <div
          aria-hidden="true"
          className="absolute -right-24 -bottom-28 h-[460px] w-[460px] opacity-[0.07]"
        >
          <LogoMark size={460} />
        </div>
        <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />

        <Logo href="/" label="Rouillard Sport, back to the site" size={38} />

        <div className="relative max-w-[440px]">
          <p className="font-mono-num text-[10.5px] font-bold uppercase tracking-[0.18em] text-gold">
            Race control
          </p>
          <h1 className="mt-4 font-display text-[40px] leading-[0.98] text-white">
            The workshop back office.
          </h1>
          <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">
            Orders, parts, content and payment proofs, all in one place and kept in sync with
            the storefront.
          </p>
          <ul className="mt-8 flex flex-col">
            {CAPABILITIES.map((item, i) => (
              <li
                key={item.text}
                className="flex items-center gap-4 border-b border-line-soft py-3.5 text-[14.5px] text-paper"
              >
                <span className="font-mono-num text-[11px] font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <i className={`fa-solid ${item.icon} text-[13px] text-gold`} aria-hidden="true" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative font-mono-num text-[11.5px] tracking-[0.06em] text-muted-dim">
          {new Date().getFullYear()} Rouillard Sport
        </p>
      </section>

      {/* Right: form panel */}
      <section className="relative flex items-center justify-center overflow-hidden bg-pit px-6 py-14 sm:px-10">
        <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-50" />

        <div className="page-enter relative w-full max-w-[400px]">
          <Logo href="/" label="Rouillard Sport, back to the site" size={34} className="lg:hidden" />

          <h2 className="mt-10 font-display text-[32px] leading-none text-white lg:mt-0">
            Sign in
          </h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            Back office for orders, parts, content and payment proofs.
          </p>
          <span aria-hidden="true" className="rule-gold mt-6 block w-24" />

          <div className="mt-8">
            <LoginForm />
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 font-mono-num text-[11.5px] uppercase tracking-[0.12em] text-muted transition-colors hover:text-gold"
          >
            <i className="fa-solid fa-arrow-left text-[10px]" aria-hidden="true" />
            Back to site
          </Link>
        </div>
      </section>
    </main>
  );
}
