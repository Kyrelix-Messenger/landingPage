import {
  motionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

/**
 * Cursor position over the viewport, -0.5 … 0.5 on each axis, as plain motion values (no React
 * state, so moving the mouse never re-renders anything). Touch input is ignored.
 */
const pointerX = motionValue(0);
const pointerY = motionValue(0);
const still = motionValue(0);

let bound = false;
let frame = 0;
let nextX = 0;
let nextY = 0;

export function bindPointer(): void {
  if (bound) return;
  bound = true;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      nextX = event.clientX / window.innerWidth - 0.5;
      nextY = event.clientY / window.innerHeight - 0.5;
      // Gaming mice can emit far more events than the screen can show. One update per frame keeps
      // the exact same visual motion while avoiding needless MotionValue work.
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          pointerX.set(nextX);
          pointerY.set(nextY);
        });
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    pointerX.set(0);
    pointerY.set(0);
  });
}

const SPRING = { stiffness: 90, damping: 18, mass: 0.6 } as const;

/**
 * The cursor position, smoothed with a spring. Under "reduced motion" every consumer receives a
 * constant 0, so parallax and tilt switch off without any special-casing at the call site.
 */
export function usePointerSpring(enabled = true): {
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const reduced = useReducedMotion();
  // Static previews use this hook too. Feeding their springs a constant avoids subscribing them
  // to every cursor movement while keeping hook order and their frozen appearance unchanged.
  const x = useSpring(enabled ? pointerX : still, SPRING);
  const y = useSpring(enabled ? pointerY : still, SPRING);
  return reduced || !enabled ? { x: still, y: still } : { x, y };
}
