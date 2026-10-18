import { memo } from "react";
import { LOCALES } from "@/shared/boot/boot";
import { APP_HOST, APP_URL } from "@/shared/config/links";
import { useTranslation, type TranslationKey } from "@/shared/i18n";
import { Brand } from "@/shared/ui/brand/Brand";
import { Icon } from "@/shared/ui/icon/Icon";
import { LocaleLink } from "@/shared/ui/locale-link/LocaleLink";
import styles from "./SiteFooter.module.css";

const SECTIONS: ReadonlyArray<{ href: string; label: TranslationKey }> = [
  { href: "#features", label: "nav.features" },
  { href: "#appearance", label: "nav.appearance" },
  { href: "#languages", label: "nav.languages" },
  { href: "#roadmap", label: "roadmap.title" },
  { href: "#faq", label: "nav.faq" },
];

/**
 * Small on purpose, and not a copy of the header: who we are, where things are, where the app is,
 * every language as a plain text link.
 */
export const SiteFooter = memo(function SiteFooter() {
  const { t, locale } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.about}>
          <Brand />
          <p className={styles.tagline}>{t("footer.tagline")}</p>
        </div>

        <nav aria-labelledby="footer-sections">
          <h2 id="footer-sections" className={styles.heading}>
            {t("footer.sections")}
          </h2>
          <ul className={styles.list}>
            {SECTIONS.map((item) => (
              <li key={item.href}>
                <a className={styles.link} href={item.href}>
                  {t(item.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.heading}>{t("footer.web")}</h2>
          <a
            className={styles.link}
            href={APP_URL}
            target="_blank"
            rel="noopener"
            translate="no"
          >
            {APP_HOST}
            <Icon name="arrowUpRight" size="1rem" />
          </a>
        </div>

        <div>
          <h2 className={styles.heading}>{t("footer.languages")}</h2>
          <ul className={styles.langs}>
            {LOCALES.map((item) => (
              <li key={item.code}>
                <LocaleLink
                  locale={item.code}
                  className={styles.lang}
                  lang={item.html}
                  translate="no"
                  aria-current={item.code === locale ? "true" : undefined}
                >
                  {item.name}
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className={styles.legal}>
        <span translate="no">© {new Date().getFullYear()} Kyrelix.</span>{" "}
        {t("footer.rights")}
      </p>
    </footer>
  );
});
