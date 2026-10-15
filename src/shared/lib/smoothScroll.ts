import { useEffect } from "react";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

const TAKE_OVER_EVENTS = [
  "wheel",
  "touchstart",
  "mousedown",
  "keydown",
] as const;

let stopCurrent: (() => void) | null = null;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Animates the window scroll position and resolves when it arrives, or when the visitor takes over
 * (wheel, touch, key). Anchor jumps used to be instant; this keeps them readable.
 * "Reduced motion" shortens the glide and drops the acceleration instead of removing it, because
 * an instant jump is exactly the disorienting behaviour that setting is meant to avoid.
 */
export function smoothScrollTo(top: number): Promise<void> {
  stopCurrent?.();
  const from = window.scrollY;
  const distance = top - from;
  if (Math.abs(distance) < 2) return Promise.resolve();

  const reduced = prefersReducedMotion();
  const length = Math.abs(distance);
  const duration = reduced
    ? Math.min(320, 160 + length * 0.05)
    : Math.min(1100, 420 + length * 0.28);
  const ease = reduced ? easeOutQuad : easeInOutCubic;

  return new Promise<void>((resolve) => {
    let frame = 0;
    const start = performance.now();

    const finish = () => {
      cancelAnimationFrame(frame);
      for (const name of TAKE_OVER_EVENTS)
        window.removeEventListener(name, finish);
      if (stopCurrent === finish) stopCurrent = null;
      resolve();
    };
    for (const name of TAKE_OVER_EVENTS)
      window.addEventListener(name, finish, { passive: true, once: true });
    stopCurrent = finish;

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, from + distance * ease(t));
      if (t < 1) frame = requestAnimationFrame(step);
      else finish();
    };
    frame = requestAnimationFrame(step);
  });
}

function targetTop(element: HTMLElement): number {
  const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
  return Math.max(
    0,
    element.getBoundingClientRect().top + window.scrollY - margin,
  );
}

/** Smooth in-page navigation for every <a href="#id"> on the page. */
export function useSmoothAnchors(): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link) return;

      const id = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
      const toTop = id === "" || id === "top";
      const target = toTop ? null : document.getElementById(id);
      if (!toTop && !target) return;

      event.preventDefault();
      const url = target
        ? `#${id}`
        : window.location.pathname + window.location.search;
      window.history.pushState(null, "", url);
      void smoothScrollTo(target ? targetTop(target) : 0).then(() => {
        if (!target) return;
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}
