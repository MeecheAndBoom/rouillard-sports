import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveCloudinaryCredentials } from "@/lib/settings";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * Session-gated upload proxy: the admin posts the file here, the server
 * forwards it to Cloudinary with basic-auth credentials (this cloud rejects
 * signed browser uploads, and the secret never leaves the server).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!(await resolveCloudinaryCredentials())) {
    return NextResponse.json(
      {
        error:
          "Cloudinary non configuré, ajoutez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "rouillard/products");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (25 Mo max)." },
      { status: 413 },
    );
  }

  try {
    const result = await uploadToCloudinary(file, folder);
    if (!result) {
      return NextResponse.json({ error: "Upload indisponible." }, { status: 503 });
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 502 },
    );
  }
}
