/**
 * A tiny bus between the page and the WebGL layers (src/widgets/scene3d). The page reports what the
 * visitor does: which control is under the cursor, a press, a message landing in the chat. The
 * scene reads it on its own frame loop. Plain module state and no React on purpose: moving the mouse
 * must never cause a render.
 */

export type FxKind = "primary" | "control" | "surface";

/** The element under the cursor that the scene reacts to, in viewport pixels. */
export interface FxTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  kind: FxKind;
}

/** Something happened at this point: a press, a message landing. Power is 0 to 1. */
export interface FxBurst {
  /** Increases with every burst; each consumer remembers the last id it has seen. */
  id: number;
  x: number;
  y: number;
  power: number;
}

export const fx = {
  /** Cursor position in viewport pixels (mouse and pen only), null when unknown or on touch. */
  pointer: null as { x: number; y: number } | null,
  target: null as FxTarget | null,
  /** The most recent bursts, newest last. */
  bursts: [] as FxBurst[],
  lastId: 0,
};

const MAX_QUEUE = 12;
const listeners = new Set<() => void>();

/** The scene asks to be woken when something is queued (its effect layer renders on demand). */
export function onFxWake(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitBurst(x: number, y: number, power = 1): void {
  if (fx.bursts.length >= MAX_QUEUE) fx.bursts.shift();
  fx.lastId += 1;
  fx.bursts.push({ id: fx.lastId, x, y, power });
  listeners.forEach((listener) => listener());
}

/** Bursts newer than the given id: every layer reads the same stream with its own cursor. */
export function burstsAfter(cursor: number): FxBurst[] {
  return fx.bursts.filter((burst) => burst.id > cursor);
}
