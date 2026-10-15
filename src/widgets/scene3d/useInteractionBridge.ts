import { useEffect } from "react";
import { emitBurst, fx, type FxKind } from "@/shared/lib/fx";

/** Everything the visitor can interact with, plus surfaces that opt in with data-fx. */
const INTERACTIVE = 'a[href], button, summary, [role="button"], [data-fx]';

/** How strong a press feels, by kind of element. */
const POWER: Record<FxKind, number> = {
  primary: 0.55,
  control: 0.34,
  surface: 0.16,
};

function kindOf(element: Element): FxKind {
  const value = element.getAttribute("data-fx");
  return value === "primary" || value === "surface" ? value : "control";
}

/**
 * Reports the cursor, the control under it and presses to the 3D scene (see shared/lib/fx.ts).
 * Document-level delegation: no element needs to know about the scene. Touch never hovers, but a
 * tap is a press like any other.
 */
export function useInteractionBridge(): void {
  useEffect(() => {
    let hovered: Element | null = null;
    let frame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const publish = () => {
      frame = 0;
      if (!hovered || !hovered.isConnected) {
        fx.target = null;
        return;
      }
      const rect = hovered.getBoundingClientRect();
      fx.target = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        kind: kindOf(hovered),
      };
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(publish);
    };
    const closest = (target: EventTarget | null): Element | null =>
      (target as Element | null)?.closest?.(INTERACTIVE) ?? null;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      hovered = closest(event.target);
      schedule();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0;
          if (fx.pointer) {
            fx.pointer.x = pointerX;
            fx.pointer.y = pointerY;
          } else {
            fx.pointer = { x: pointerX, y: pointerY };
          }
        });
      }
    };
    const onDown = (event: PointerEvent) => {
      const element = closest(event.target);
      if (element)
        emitBurst(event.clientX, event.clientY, POWER[kindOf(element)]);
    };
    const onLeave = () => {
      hovered = null;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      fx.pointer = null;
      schedule();
    };
    const onScroll = () => {
      if (hovered) schedule();
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pointerFrame);
      fx.target = null;
      fx.pointer = null;
    };
  }, []);
}
