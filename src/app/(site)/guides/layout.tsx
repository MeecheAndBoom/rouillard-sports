import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return {
    title: {
      default: t.resources.guidesTitle,
      template: `%s | ${t.resources.guidesTitle} | ${t.meta.siteName}`,
    },
    description: t.resources.guidesHubLead,
    alternates: { canonical: "/guides" },
    openGraph: {
      locale,
    },
  };
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
