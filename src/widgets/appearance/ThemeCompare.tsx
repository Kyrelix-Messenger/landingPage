import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { findLocale, type Theme } from "@/shared/boot/boot";
import { useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { useThemeStore } from "@/shared/theme";
import { Icon } from "@/shared/ui/icon/Icon";
import { AppPreview } from "@/widgets/app-preview/AppPreview";
import { restingAnchor, restingPosition, snap } from "./compareMath";
import styles from "./Appearance.module.css";

/** The finished conversation, frozen: no focus, no clicks, hidden from assistive technology. */
const FrozenPreview = memo(function FrozenPreview() {
  return (
    <div className={styles.frozen} inert aria-hidden="true">
      <AppPreview interactive={false} className={styles.fill} />
    </div>
  );
});

const themeIcon = (theme: Theme) => (theme === "light" ? "sun" : "moon");
const themeLabel = (theme: Theme) =>
  theme === "light" ? "appearance.light" : "appearance.dark";

/**
 * The same window in both themes, split by a draggable divider (a native range input, so it works
 * from the keyboard). The page's own theme fills most of the frame and the other theme sits on the
 * chat-list side, about a third, so the lighter theme never floods the dark page; when the theme of
 * the page changes, the two swap roles. The divider rests just in front of the message column and
 * is magnetic around that place.
 */
export function ThemeCompare() {
  const { t, locale } = useTranslation();
  const siteTheme = useThemeStore((state) => state.theme);
  const other: Theme = siteTheme === "dark" ? "light" : "dark";
  const rtl = findLocale(locale)?.dir === "rtl";

  const frame = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  /** Null while the divider rests at its anchor; a number once it has been moved. */
  const [moved, setMoved] = useState<number | null>(null);
  const dragging = useRef(false);
  const inView = useInView(root, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();

  const position = moved ?? restingPosition(anchor);

  // the sweep below reads the latest anchor without restarting whenever it changes
  const anchorRef = useRef<number | null>(null);
  useEffect(() => {
    anchorRef.current = anchor;
  }, [anchor]);

  // where the chat list ends, measured on the real layout; follows resizes and language changes
  useEffect(() => {
    const box = frame.current;
    if (!box) return;
    const measure = () => {
      const list = box.querySelector<HTMLElement>('[data-anchor="list"]');
      const bounds = box.getBoundingClientRect();
      const rect = list?.getBoundingClientRect();
      const gap =
        parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;
      setAnchor(
        rect
          ? restingAnchor(
              { left: bounds.left + box.clientLeft, width: box.clientWidth },
              rect,
              gap,
              rtl,
            )
          : null,
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [rtl]);

  // one gentle sweep when it first scrolls into view, so it is clear the divider can be dragged
  useEffect(() => {
    if (!inView || reducedMotion) return;
    const element = root.current;
    const start = performance.now();
    const duration = 2400;
    let frameId = 0;
    let stopped = false;

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(frameId);
    };
    const step = (now: number) => {
      if (stopped) return;
      const progress = Math.min(1, (now - start) / duration);
      const rest = restingPosition(anchorRef.current);
      setMoved(
        progress < 1
          ? rest + Math.sin(progress * Math.PI * 2) * 12 * (1 - progress * 0.3)
          : null,
      );
      if (progress < 1) frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    element?.addEventListener("pointerdown", stop, { once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      stop();
      element?.removeEventListener("pointerdown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [inView, reducedMotion]);

  const onChange = (raw: number) => {
    // the magnet works for the pointer only: with the keyboard it would trap the divider
    const next = dragging.current ? snap(raw, anchor) : raw;
    setMoved(next === anchor ? null : next);
  };

  const leftTheme = rtl ? siteTheme : other;
  const rightTheme = rtl ? other : siteTheme;

  return (
    <div className={styles.wrap}>
      <div ref={root}>
        <div
          ref={frame}
          className={styles.compare}
          style={{ "--pos": `${position}%` } as CSSProperties}
        >
          <div className={styles.layer} data-theme={siteTheme}>
            <FrozenPreview />
          </div>
          <div
            className={cn(styles.layer, styles.top, rtl && styles.topEnd)}
            data-theme={other}
            aria-hidden="true"
          >
            <FrozenPreview />
          </div>

          <input
            className={styles.range}
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={position}
            aria-label={t("appearance.compare")}
            onPointerDown={() => {
              dragging.current = true;
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            onPointerCancel={() => {
              dragging.current = false;
            }}
            onChange={(event) => onChange(Number(event.target.value))}
          />
          <div className={styles.handle} aria-hidden="true">
            <span className={styles.knob}>
              <Icon name="compare" size="1.375rem" strokeWidth={2.25} />
            </span>
          </div>
        </div>
        <p className={styles.legend} aria-hidden="true">
          <span dir="auto">
            <Icon name={themeIcon(leftTheme)} size="1.125rem" />
            {t(themeLabel(leftTheme))}
          </span>
          <span dir="auto">
            {t(themeLabel(rightTheme))}
            <Icon name={themeIcon(rightTheme)} size="1.125rem" />
          </span>
        </p>
      </div>
    </div>
  );
}
