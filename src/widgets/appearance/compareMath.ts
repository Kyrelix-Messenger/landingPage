/** Positions are percentages of the frame width, counted from the physical left edge. */

/** How close (in %) the divider has to come to its resting place for the "magnet" to take it. */
export const SNAP_RANGE = 2.5;

/** Where the divider rests when the window is too narrow to show two panes: the middle. */
export const SINGLE_PANE_REST = 50;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Magnet: a position within `range` of the anchor snaps onto it; everything else is left alone. */
export function snap(
  value: number,
  anchor: number | null,
  range: number = SNAP_RANGE,
): number {
  return anchor !== null && Math.abs(value - anchor) <= range ? anchor : value;
}

interface Box {
  left: number;
  width: number;
}

interface Pane {
  left: number;
  right: number;
}

/**
 * The resting place of the divider: the gap in front of the message column, a small distance away
 * from the messages, so the other theme covers the chat list (about a third of the window) and does
 * not cut through a bubble. In a right-to-left page the chat list is on the right, so the edge
 * facing the messages is its left one. Null when the window shows a single pane (the list is hidden).
 */
export function restingAnchor(
  frame: Box,
  list: Pane,
  gap: number,
  rtl: boolean,
): number | null {
  if (frame.width <= 0 || list.right - list.left <= 0) return null;
  const edge = rtl ? list.left - gap / 2 : list.right + gap / 2;
  return clamp(((edge - frame.left) / frame.width) * 100, 8, 92);
}

/** Resting position: at the anchor when there is one, in the middle otherwise. */
export function restingPosition(anchor: number | null): number {
  return anchor ?? SINGLE_PANE_REST;
}
