"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: "fa-chart-line" },
  { href: "/admin/orders", label: "Orders", icon: "fa-bag-shopping" },
  { href: "/admin/products", label: "Parts", icon: "fa-gears" },
  { href: "/admin/blog", label: "Blog", icon: "fa-newspaper" },
  { href: "/admin/categories", label: "Categories", icon: "fa-table-cells-large" },
  { href: "/admin/reviews", label: "Reviews", icon: "fa-star" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "fa-envelope" },
  { href: "/admin/settings", label: "Settings", icon: "fa-gear" },
];

/** Back-office section rail. The active section is marked with a gold bar. */
export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Admin sections"
      className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4 lg:grid-cols-1"
    >
      {NAV.map((link, i) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 bg-panel px-3.5 py-3 transition-colors duration-150 ${
              active ? "text-white" : "text-muted hover:bg-panel-2 hover:text-paper"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-0 bottom-0 left-0 w-[2px] transition-colors duration-150 ${
                active ? "bg-gold" : "bg-transparent"
              }`}
            />
            <span className="font-mono-num text-[10px] font-bold text-muted-dim">
              {String(i + 1).padStart(2, "0")}
            </span>
            <i
              className={`fa-solid ${link.icon} w-4 text-center text-[12px] ${
                active ? "text-gold" : "text-muted-dim"
              }`}
              aria-hidden="true"
            />
            <span className="text-[14px]">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
