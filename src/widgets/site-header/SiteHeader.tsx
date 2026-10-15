import { useEffect, useId, useState, type MouseEvent, memo } from "react";
import { useTranslation, type TranslationKey } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Brand } from "@/shared/ui/brand/Brand";
import { Icon } from "@/shared/ui/icon/Icon";
import { LanguageMenu } from "./ui/LanguageMenu";
import { ThemeToggle } from "./ui/ThemeToggle";
import styles from "./SiteHeader.module.css";

const LINKS: ReadonlyArray<{ href: string; label: TranslationKey }> = [
  { href: "#features", label: "nav.features" },
  { href: "#appearance", label: "nav.appearance" },
  { href: "#languages", label: "nav.languages" },
  { href: "#faq", label: "nav.faq" },
];

/** A flat bar across the whole viewport: brand, sections, language and theme. No call to action. */
export const SiteHeader = memo(function SiteHeader() {
  const { t } = useTranslation();
  const navId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 8);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // the phone menu closes on Escape, on an outside tap and when the window grows past the breakpoint
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest(`[data-site-header]`))
        setMenuOpen(false);
    };
    const wide = window.matchMedia("(min-width: 901px)");
    const onWide = () => wide.matches && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const closeOnNavigate = (event: MouseEvent) => {
    if ((event.target as Element).closest("a")) setMenuOpen(false);
  };

  return (
    <header
      className={cn(styles.header, scrolled && styles.scrolled)}
      data-site-header
    >
      <div className={styles.bar}>
        <Brand />

        <nav
          id={navId}
          className={cn(styles.nav, menuOpen && styles.navOpen)}
          aria-label={t("nav.main")}
          onClick={closeOnNavigate}
        >
          {LINKS.map((link) => (
            <a key={link.href} className={styles.link} href={link.href}>
              {t(link.label)}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageMenu />
          <ThemeToggle />
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls={navId}
            aria-label={t("nav.menu")}
            title={t("nav.menu")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} size="1.375rem" />
          </button>
        </div>
      </div>
    </header>
  );
});
