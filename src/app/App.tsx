import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { HomePage } from "@/pages/home/HomePage";
import { useLocaleStore, useTranslation } from "@/shared/i18n";
import { bindPointer } from "@/shared/lib/pointer";
import { useSmoothAnchors } from "@/shared/lib/smoothScroll";
import { Scene3D } from "@/widgets/scene3d/Scene3D";
import { SiteBackground } from "@/widgets/site-background/SiteBackground";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import styles from "./App.module.css";

function setMeta(selector: string, content: string): void {
  document.querySelector(selector)?.setAttribute("content", content);
}

export function App() {
  const { t } = useTranslation();
  const switching = useLocaleStore((state) => state.switching);

  useSmoothAnchors();
  useEffect(() => bindPointer(), []);

  // the language switch fades the page out and in (see #root in base.css)
  useEffect(() => {
    document.documentElement.toggleAttribute("data-switching", switching);
  }, [switching]);

  // the static <head> is English; keep title and descriptions in the active language
  useEffect(() => {
    document.title = t("meta.title");
    setMeta('meta[name="description"]', t("meta.description"));
    setMeta('meta[property="og:title"]', t("meta.title"));
    setMeta('meta[property="og:description"]', t("meta.description"));
  }, [t]);

  return (
    // transforms are skipped for people who asked for less motion; fades and colour changes stay
    <MotionConfig reducedMotion="user">
      <SiteBackground />
      <Scene3D />
      <a className={styles.skip} href="#main">
        {t("a11y.skip")}
      </a>
      <div id="top" />
      <SiteHeader />
      <main id="main" className={styles.main}>
        <HomePage />
      </main>
      <SiteFooter />
    </MotionConfig>
  );
}
