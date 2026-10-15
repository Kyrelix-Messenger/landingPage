import { APP_HOST, APP_URL } from "@/shared/config/links";
import { useTranslation } from "@/shared/i18n";
import { Button } from "@/shared/ui/button/Button";
import { GlowSurface } from "@/shared/ui/glow/GlowSurface";
import { Icon } from "@/shared/ui/icon/Icon";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import styles from "./Cta.module.css";

export function Cta() {
  const { t } = useTranslation();
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <Reveal>
        <GlowSurface
          className={styles.panel}
          glowClassName={styles.glow}
          data-fx="surface"
        >
          <div className={styles.copy}>
            <h2 id="cta-title" className={styles.title}>
              {t("cta.title")}
            </h2>
            <p className={styles.text}>{t("cta.text")}</p>
          </div>
          <div className={styles.action}>
            <Button size="lg" href={APP_URL} external>
              {t("cta.button")}
              <Icon name="arrowUpRight" />
            </Button>
            <span className={styles.host} translate="no">
              {APP_HOST}
            </span>
          </div>
        </GlowSurface>
      </Reveal>
    </section>
  );
}
