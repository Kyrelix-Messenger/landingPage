/** Small pure helpers for the WebGL layers, kept apart from three.js so they can be tested. */

/** Camera distance in CSS pixels: with this fov the z = 0 plane maps one world unit to one pixel. */
export const CAMERA_DISTANCE = 1000;

/** Vertical field of view (degrees) that makes the z = 0 plane exactly `height` world units tall. */
export function fovFor(
  height: number,
  distance: number = CAMERA_DISTANCE,
): number {
  return (2 * Math.atan(height / 2 / distance) * 180) / Math.PI;
}

/**
 * Scale from "how it should look on screen" to world units for an object at depth `z` (negative is
 * farther away). Multiply screen offsets and sizes by it, so depth only changes parallax and overlap,
 * never the apparent position or size.
 */
export function depthScale(
  z: number,
  distance: number = CAMERA_DISTANCE,
): number {
  return (distance - z) / distance;
}

export interface Spring {
  x: number;
  v: number;
}

/** One integration step of a damped spring, in place. */
export function stepSpring(
  spring: Spring,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
): void {
  spring.v += ((target - spring.x) * stiffness - spring.v * damping) * dt;
  spring.x += spring.v * dt;
}

export function easeOutCubic(t: number): number {
  const u = 1 - Math.min(1, Math.max(0, t));
  return 1 - u * u * u;
}

/** Deterministic pseudo-random numbers (mulberry32), so a scene is the same on every load. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
