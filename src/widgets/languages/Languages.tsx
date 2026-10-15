import { LOCALES, findLocale } from "@/shared/boot/boot";
import { useLocaleStore, useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon/Icon";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import { Section } from "@/shared/ui/section/Section";
import styles from "./Languages.module.css";

/** Compact on purpose: ten names fit in one small block. Arabic needs no special case, bidi handles it. */
export function Languages() {
  const { t, locale } = useTranslation();
  const source = useLocaleStore((state) => state.source);
  const allowMachineTranslation = useLocaleStore(
    (state) => state.allowMachineTranslation,
  );
  const setLocale = useLocaleStore((state) => state.setLocale);
  const active = findLocale(locale) ?? LOCALES[1];

  return (
    <Section
      id="languages"
      narrow
      title={t("languages.title")}
      lead={t("languages.lead")}
    >
      <Reveal>
        <div className={styles.panel}>
          <ul className={styles.chips} aria-label={t("nav.languages")}>
            {LOCALES.map((item) => {
              const selected = item.code === locale;
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    className={cn(styles.chip, selected && styles.selected)}
                    lang={item.html}
                    translate="no"
                    aria-pressed={selected}
                    onClick={() => void setLocale(item.code)}
                  >
                    {item.name}
                    {selected && (
                      <Icon name="check" size="1rem" strokeWidth={2.5} />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {source === "browser" && (
            <p className={styles.note}>
              {t("languages.detected")}{" "}
              <strong translate="no" lang={active.html}>
                {active.name}
              </strong>
            </p>
          )}

          {allowMachineTranslation && (
            <p className={styles.fallback} role="note">
              <Icon name="info" size="1.25rem" />
              {t("languages.fallback")}
            </p>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
