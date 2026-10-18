import { useEffect } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { HomePage } from "@/pages/home/HomePage";
import { useLocaleStore, useTranslation } from "@/shared/i18n";
import { updateSeo } from "@/shared/seo/metadata";
import { bindPointer } from "@/shared/lib/pointer";
import { useSmoothAnchors } from "@/shared/lib/smoothScroll";
import { Scene3D } from "@/widgets/scene3d/Scene3D";
import { SiteBackground } from "@/widgets/site-background/SiteBackground";
import { SiteFooter } from "@/widgets/site-footer/SiteFooter";
import { SiteHeader } from "@/widgets/site-header/SiteHeader";
import styles from "./App.module.css";

export function App() {
  const { t, locale } = useTranslation();
  const dictionary = useLocaleStore((state) => state.dict);
  const switching = useLocaleStore((state) => state.switching);

  useSmoothAnchors();
  useEffect(() => bindPointer(), []);

  // the language switch fades the page out and in (see #root in base.css)
  useEffect(() => {
    document.documentElement.toggleAttribute("data-switching", switching);
  }, [switching]);

  // Static HTML already has these tags; keep all metadata in sync with in-page language changes.
  useEffect(() => {
    updateSeo(locale, dictionary);
  }, [locale, dictionary]);

  return (
    // transforms are skipped for people who asked for less motion; fades and colour changes stay
    // `m` components plus the small domAnimation feature set instead of the full `motion` bundle;
    // `strict` makes any stray `motion.*` import fail loudly instead of quietly growing the bundle
    <LazyMotion features={domAnimation} strict>
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
    </LazyMotion>
  );
}
