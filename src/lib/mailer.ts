import { promises as fs } from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { resolveSmtp } from "./settings";

export type SendResult = {
  delivered: boolean;
  savedPath?: string;
  error?: string;
};

/**
 * Sends React Email templates through SMTP (Gmail app password in
 * .env.local). When SMTP isn't configured the rendered HTML is written to
 * data/outbox/ so the flow stays testable end-to-end without a mail server.
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
}): Promise<SendResult> {
  const html = await render(react);
  const smtp = await resolveSmtp();

  if (!smtp) {
    const savedPath = await saveToOutbox(subject, html);
    return {
      delivered: false,
      savedPath,
      error: "SMTP not configured, saved to data/outbox",
    };
  }

  try {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
    await transport.sendMail({
      from: smtp.from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });
    return { delivered: true };
  } catch (err) {
    const savedPath = await saveToOutbox(subject, html);
    return {
      delivered: false,
      savedPath,
      error: err instanceof Error ? err.message : "Send failed",
    };
  }
}

async function saveToOutbox(subject: string, html: string): Promise<string | undefined> {
  try {
    const dir = path.join(process.cwd(), "data", "outbox");
    await fs.mkdir(dir, { recursive: true });
    const safe = subject.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60);
    const file = path.join(dir, `${Date.now()}-${safe}.html`);
    await fs.writeFile(file, html, "utf8");
    return file;
  } catch {
    return undefined;
  }
}
