import { useCallback } from "react";
import type { TranslationKey } from "../dictionaries/en";
import { useLocaleStore } from "../model/localeContext";

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const dict = useLocaleStore((state) => state.dict);
  const t = useCallback((key: TranslationKey) => dict[key], [dict]);
  return { t, locale };
}
