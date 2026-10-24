import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/** Session probe used by the client-side AdminGuard. */
export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    session ? { email: session.email, name: session.name } : {},
    { headers: { "Cache-Control": "no-store" } },
  );
}
