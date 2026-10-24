import type { Product } from "@/lib/types";

/** Injects JSON-LD as a script tag — kept server-only to avoid hydration noise. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export type { Product };
