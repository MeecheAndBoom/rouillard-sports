import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/**
 * Serves locally staged payment proofs (the fallback when Cloudinary isn't
 * configured). Path segments are sanitised to prevent traversal; in
 * production with Cloudinary enabled this route simply 404s.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ ref: string; file: string }> },
) {
  const { ref, file } = await context.params;

  const safeRef = ref.replace(/[^A-Z0-9-]/gi, "");
  const safeFile = file.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safeRef || !safeFile || safeFile.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "data", "proofs", safeRef, safeFile);
  try {
    const bytes = await fs.readFile(filePath);
    const ext = safeFile.split(".").pop()?.toLowerCase() ?? "jpg";
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
