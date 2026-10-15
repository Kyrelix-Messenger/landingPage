import { m, type Variants } from "framer-motion";
import { APP_URL } from "@/shared/config/links";
import { useTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { AppPreview } from "@/widgets/app-preview/AppPreview";
import styles from "./Hero.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <m.div
        className={styles.copy}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <m.h1 id="hero-title" className={styles.title} variants={item}>
          <span>{t("hero.title1")}</span>{" "}
          <span className={styles.accent}>{t("hero.title2")}</span>
        </m.h1>

        <m.p className={styles.lead} variants={item}>
          {t("hero.lead")}
        </m.p>

        <m.div className={styles.actions} variants={item}>
          <Button size="lg" href={APP_URL} external>
            {t("hero.cta")}
            <Icon name="arrowRight" className={styles.arrow} />
          </Button>
          <Button size="lg" variant="glass" href="#features">
            {t("hero.more")}
          </Button>
        </m.div>

        <m.ul className={styles.platforms} variants={item}>
          <li className={styles.platform}>
            <Icon name="globe" size="1.5rem" strokeWidth={1.5} />
            <span className={styles.platformText}>
              <strong>{t("hero.web")}</strong>
              <span className={styles.available}>
                <i className={styles.dot} />
                {t("hero.webStatus")}
              </span>
            </span>
          </li>
          <li className={styles.divider} aria-hidden="true" />
          <li className={styles.platform}>
            <Icon name="phone" size="1.5rem" strokeWidth={1.5} />
            <span className={styles.platformText}>
              <strong>{t("hero.mobile")}</strong>
              <span className={styles.planned}>{t("hero.mobileStatus")}</span>
            </span>
          </li>
        </m.ul>
      </m.div>

      <div className={styles.visual}>
        <AppPreview />
        <p className={styles.hint}>{t("hero.demoHint")}</p>
      </div>
    </section>
  );
}
