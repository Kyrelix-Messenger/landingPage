import type { Theme } from "@/shared/boot/boot";

/** Colours of the 3D layers per theme. The brand blues and indigos, as the CSS spheres use. */
export interface ScenePalette {
  /** Orb gradient, top and bottom. */
  orbA: string;
  orbB: string;
  /** Press effects: ring colour and the shard tones (picked at random). */
  ring: string;
  shards: readonly [string, string, string, string];
  /** 0 on the light theme, 1 on the dark one (the glass shader lifts its body a little). */
  dark: number;
}

export const PALETTE: Record<Theme, ScenePalette> = {
  light: {
    orbA: "#bfdbfe",
    orbB: "#a5b4fc",
    ring: "#3b82f6",
    shards: ["#2563eb", "#4f46e5", "#0ea5e9", "#7c3aed"],
    dark: 0,
  },
  dark: {
    orbA: "#6d75f2",
    orbB: "#2f6fe6",
    ring: "#a5b4fc",
    shards: ["#a5b4fc", "#818cf8", "#38bdf8", "#c4b5fd"],
    dark: 1,
  },
};
