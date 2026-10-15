/**
 * Timing of the demo conversation. It has to look like two people typing on phones, so nothing
 * appears instantly: the other person first reads, then "types" for a while, then the message lands.
 */

/** How long the typing indicator shows for a message of this length (ms). */
export function typingDuration(length: number): number {
  return Math.min(3600, Math.max(1600, 900 + length * 55));
}

/** Pause between your message and the other person starting to type (they have to read it). */
export const READ_DELAY = 1200;

/** Length of a typical short reply ("Got it.", "Sounds good."), for the typing time of auto-replies. */
const SHORT_REPLY = 14;

/** Auto-reply to something you sent: typing starts after READ_DELAY, the answer lands after typing. */
export const REPLY_TYPING_AT = READ_DELAY;
export const REPLY_AT = READ_DELAY + typingDuration(SHORT_REPLY);

/** One step of the opening conversation, in ms after mount. */
export interface IntroStep {
  at: number;
  kind: "typing-on" | "typing-off" | "message";
  /** For "message": how many seed messages are visible after this step. */
  count?: number;
}

/**
 * The opening conversation. Mia types for about two and a half seconds, you answer after reading,
 * she types again, you close the thread. About twelve seconds in total, and each message arrives at
 * the moment its typing indicator ends.
 */
export const INTRO: readonly IntroStep[] = [
  { at: 1200, kind: "typing-on" },
  { at: 3600, kind: "typing-off" },
  { at: 3600, kind: "message", count: 1 },
  { at: 5900, kind: "message", count: 2 },
  { at: 7200, kind: "typing-on" },
  { at: 9500, kind: "typing-off" },
  { at: 9500, kind: "message", count: 3 },
  { at: 12000, kind: "message", count: 4 },
];
