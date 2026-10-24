import { redirect } from "next/navigation";

/** Alias route — the canonical browse experience lives at /shop. */
export default function BrowseAlias() {
  redirect("/shop");
}
