import { resolveCloudinaryCredentials } from "./settings";

/**
 * Server-side uploads with HTTP basic auth (key:secret).
 *
 * Signed direct-to-cloud browser uploads were the original pattern, but this
 * cloud rejects both SHA-1 and SHA-256 signatures, while basic-auth uploads
 * are accepted. Keeping uploads server-side is also safer — the API secret
 * never reaches the browser, and every upload stays session-gated.
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<{ url: string; publicId: string } | null> {
  const creds = await resolveCloudinaryCredentials();
  if (!creds) return null;

  const form = new FormData();
  form.append("file", file);
  if (/^[a-z0-9/_-]+$/i.test(folder)) form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${creds.cloudName}/auto/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString("base64")}`,
      },
      body: form,
    },
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
  const data = (await res.json()) as { secure_url: string; public_id: string };
  return { url: data.secure_url, publicId: data.public_id };
}

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}
