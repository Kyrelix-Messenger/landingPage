import { useTranslation } from "@/shared/i18n";
import { Icon } from "@/shared/ui/icon/Icon";
import { Section } from "@/shared/ui/section/Section";
import { ThemeCompare } from "./ThemeCompare";
import styles from "./Appearance.module.css";

export function Appearance() {
  const { t } = useTranslation();
  return (
    <Section
      id="appearance"
      split
      title={t("appearance.title")}
      lead={t("appearance.lead")}
      extra={
        <ul className={styles.facts}>
          <li>
            <Icon name="swapSide" size="1.375rem" strokeWidth={1.5} />
            {t("appearance.fact1")}
          </li>
          <li>
            <Icon name="phone" size="1.375rem" strokeWidth={1.5} />
            {t("appearance.fact2")}
          </li>
        </ul>
      }
    >
      <ThemeCompare />
    </Section>
  );
}
