import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return {
    title: {
      default: t.resources.toolsTitle,
      template: `%s | ${t.resources.toolsTitle} | ${t.meta.siteName}`,
    },
    description: t.resources.toolsHubLead,
    alternates: { canonical: "/tools" },
    openGraph: {
      locale,
    },
  };
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
