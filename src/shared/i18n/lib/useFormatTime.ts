import { useMemo } from "react";
import { findLocale } from "@/shared/boot/boot";
import { useLocaleStore } from "../model/localeContext";

/** hh:mm in the visitor's language, the way the messenger formats message times. */
export function useFormatTime(): (date: Date) => string {
  const locale = useLocaleStore((state) => state.locale);
  const tag = findLocale(locale)?.html ?? "en";
  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat(tag, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (date: Date) => formatter.format(date);
  }, [tag]);
}
