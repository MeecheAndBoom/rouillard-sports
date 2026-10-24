import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { AdminHead } from "@/components/admin/AdminUi";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <>
      <AdminHead
        title="Settings"
        subtitle="Site identity, payment methods, delivery and integrations."
      />
      <SettingsForm
        settings={settings}
        cloudinaryConfigured={Boolean(
          process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET,
        )}
        smtpConfigured={Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)}
      />
    </>
  );
}
