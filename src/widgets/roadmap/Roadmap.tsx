import { useTranslation, type TranslationKey } from "@/shared/i18n";
import { Icon, type IconName } from "@/shared/ui/icon/Icon";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import { Section } from "@/shared/ui/section/Section";
import styles from "./Roadmap.module.css";

interface Item {
  icon: IconName;
  title: TranslationKey;
  text: TranslationKey;
  status: TranslationKey;
}

const ITEMS: readonly Item[] = [
  {
    icon: "calls",
    title: "roadmap.calls.title",
    text: "roadmap.calls.text",
    status: "roadmap.calls.status",
  },
  {
    icon: "phone",
    title: "roadmap.mobile.title",
    text: "roadmap.mobile.text",
    status: "roadmap.mobile.status",
  },
  {
    icon: "business",
    title: "roadmap.business.title",
    text: "roadmap.business.text",
    status: "roadmap.business.status",
  },
];

export function Roadmap() {
  const { t } = useTranslation();
  return (
    <Section id="roadmap" split title={t("roadmap.title")}>
      <Reveal>
        <ul className={styles.list}>
          {ITEMS.map((item) => (
            <li key={item.title} className={styles.item}>
              <span className={styles.icon}>
                <Icon name={item.icon} size="1.625rem" strokeWidth={1.5} />
              </span>
              <span className={styles.body}>
                <strong className={styles.title}>{t(item.title)}</strong>
                <span className={styles.text}>{t(item.text)}</span>
              </span>
              <span className={styles.status}>{t(item.status)}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
