import type { ComponentPropsWithoutRef } from "react";
import { findLocale, type LocaleCode } from "@/shared/boot/boot";
import { useLocaleStore, useTranslation } from "@/shared/i18n";
import { localeHref } from "@/shared/seo/localeUrls";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href" | "hrefLang"> & {
  locale: LocaleCode;
};

/** A crawlable link with progressive enhancement: normal clicks keep the existing fade. */
export function LocaleLink({ locale: target, onClick, ...props }: Props) {
  const { locale } = useTranslation();
  const setLocale = useLocaleStore((state) => state.setLocale);
  return (
    <a
      {...props}
      href={localeHref(target, locale)}
      hrefLang={findLocale(target)!.html}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.currentTarget.target === "_blank"
        )
          return;
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        void setLocale(target);
      }}
    />
  );
}
