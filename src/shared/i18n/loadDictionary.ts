import type { LocaleCode } from "@/shared/boot/boot";
import { en, type Dictionary } from "./dictionaries/en";

type Loader = () => Promise<{ default: Dictionary }>;

/** One chunk per language: a visitor only downloads the dictionary they actually use. */
const loaders: Record<Exclude<LocaleCode, "en">, Loader> = {
  ru: () => import("./dictionaries/ru"),
  zh: () => import("./dictionaries/zh"),
  es: () => import("./dictionaries/es"),
  fr: () => import("./dictionaries/fr"),
  de: () => import("./dictionaries/de"),
  ar: () => import("./dictionaries/ar"),
  pt: () => import("./dictionaries/pt"),
  ja: () => import("./dictionaries/ja"),
  pl: () => import("./dictionaries/pl"),
};

const cache = new Map<LocaleCode, Dictionary>([["en", en]]);

export async function loadDictionary(code: LocaleCode): Promise<Dictionary> {
  const cached = cache.get(code);
  if (cached) return cached;
  if (code === "en") return en;
  const dictionary = (await loaders[code]()).default;
  cache.set(code, dictionary);
  return dictionary;
}
