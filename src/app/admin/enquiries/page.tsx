import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listEnquiries } from "@/lib/enquiries";
import { dateTime } from "@/lib/format";
import { AdminHead, ResponsiveList, Pill } from "@/components/admin/AdminUi";
import { EnquiryActions } from "@/components/admin/ModerationButtons";

export const metadata: Metadata = {
  title: "Enquiries",
  robots: { index: false, follow: false },
};

const KIND_TONE: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  contact: "accent",
  quote: "warning",
  affiliate: "neutral",
  review: "neutral",
  part: "accent",
};

/**
 * Inbox. Contact, quote and affiliate forms land in one stream. The open
 * count reads in the subtitle and every row can be closed or deleted.
 */
export default async function AdminEnquiriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const enquiries = await listEnquiries();
  const open = enquiries.filter((e) => !e.handled).length;

  return (
    <>
      <AdminHead
        title="Enquiries"
        subtitle={`${enquiries.length} messages. ${open} still open.`}
      />

      <ResponsiveList
        rows={enquiries}
        getKey={(enquiry) => enquiry.id}
        empty="Inbox is empty. Contact, quote and affiliate forms land here."
        columns={[
          {
            key: "id",
            header: "ID",
            render: (enquiry) => (
              <span className="font-mono-num text-[13px] text-muted">{enquiry.id}</span>
            ),
          },
          {
            key: "kind",
            header: "Kind",
            render: (enquiry) => (
              <Pill tone={KIND_TONE[enquiry.kind] ?? "neutral"}>{enquiry.kind}</Pill>
            ),
          },
          {
            key: "from",
            header: "From",
            render: (enquiry) => (
              <span className="flex flex-col">
                <span className="font-medium text-paper">{enquiry.name}</span>
                <span className="font-mono-num text-[12.5px] text-muted">{enquiry.email}</span>
                {enquiry.phone ? (
                  <span className="font-mono-num text-[12.5px] text-muted">{enquiry.phone}</span>
                ) : null}
              </span>
            ),
          },
          {
            key: "message",
            header: "Message",
            render: (enquiry) => (
              <span className="flex max-w-[420px] flex-col">
                {enquiry.subject ? (
                  <span className="text-[14px] font-medium text-paper">{enquiry.subject}</span>
                ) : null}
                <span className="line-clamp-2 text-[13.5px] text-muted">
                  {enquiry.message ?? "-"}
                </span>
              </span>
            ),
          },
          {
            key: "received",
            header: "Received",
            render: (enquiry) => (
              <span className="font-mono-num text-[13px] text-muted">
                {enquiry.createdAt ? dateTime(enquiry.createdAt) : "-"}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (enquiry) => (
              <Pill tone={enquiry.handled ? "success" : "warning"}>
                {enquiry.handled ? "handled" : "open"}
              </Pill>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (enquiry) => (
              <EnquiryActions id={enquiry.id} handled={enquiry.handled} />
            ),
          },
        ]}
        tile={(enquiry) => (
          <div className="border border-line bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[15px] font-medium text-paper">{enquiry.name}</span>
              <Pill tone={enquiry.handled ? "success" : "warning"}>
                {enquiry.handled ? "handled" : "open"}
              </Pill>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Pill tone={KIND_TONE[enquiry.kind] ?? "neutral"}>{enquiry.kind}</Pill>
              <span className="font-mono-num text-[13px] text-muted">{enquiry.email}</span>
            </div>
            {enquiry.message ? (
              <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-muted">
                {enquiry.message}
              </p>
            ) : null}
            <p className="mt-2 font-mono-num text-[12.5px] text-muted-dim">
              {enquiry.createdAt ? dateTime(enquiry.createdAt) : ""}
            </p>
            <div className="mt-3 flex justify-end border-t border-line-soft pt-3">
              <EnquiryActions id={enquiry.id} handled={enquiry.handled} />
            </div>
          </div>
        )}
      />
    </>
  );
}
