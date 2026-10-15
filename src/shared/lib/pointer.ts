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

export function bindPointer(): void {
  if (bound) return;
  bound = true;
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => {
    pointerX.set(0);
    pointerY.set(0);
  });
}

const SPRING = { stiffness: 90, damping: 18, mass: 0.6 } as const;

/**
 * The cursor position, smoothed with a spring. Under "reduced motion" every consumer receives a
 * constant 0, so parallax and tilt switch off without any special-casing at the call site.
 */
export function usePointerSpring(): {
  x: MotionValue<number>;
  y: MotionValue<number>;
} {
  const reduced = useReducedMotion();
  const x = useSpring(pointerX, SPRING);
  const y = useSpring(pointerY, SPRING);
  return reduced ? { x: still, y: still } : { x, y };
}
