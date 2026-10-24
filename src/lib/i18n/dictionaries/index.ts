import { fr, type Dictionary } from "./fr";
import { en } from "./en";
import type { Locale } from "../config";

export const dictionaries: Record<Locale, Dictionary> = { fr, en };

export type { Dictionary };
export { fr, en };
