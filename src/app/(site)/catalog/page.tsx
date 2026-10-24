import { redirect } from "next/navigation";

/** Legacy/alias route — the canonical catalog lives at /shop. */
export default function CatalogAlias() {
  redirect("/shop");
}
