import type { FxBurst, FxTarget } from "@/shared/lib/fx";
import { stepSpring, type Spring } from "./math3d";

/** One floating glass shape. Everything is relative to the viewport, so the scene fits any screen. */
export type OrbShape = "sphere" | "gem" | "ring";

export interface OrbDef {
  shape: OrbShape;
  /** Home position as a fraction of the viewport (0 to 1). */
  nx: number;
  ny: number;
  /** Depth: only changes parallax and overlap, never the apparent size or place. */
  z: number;
  /** Radius as a fraction of the shorter viewport side. */
  radius: number;
  /** How strongly the shape follows the cursor (nearer shapes move more). */
  depth: number;
  /** Idle drift: speed (rad/s) and amplitude (fraction of the shorter side). */
  speed: number;
  amplitude: number;
  phase: number;
}

export interface FieldInput {
  width: number;
  height: number;
  /** Cursor in viewport pixels, null on touch or before the first move. */
  pointer: { x: number; y: number } | null;
  target: FxTarget | null;
  bursts: readonly FxBurst[];
}

const POSITION = { stiffness: 34, damping: 7 } as const;
const SCALE = { stiffness: 90, damping: 11 } as const;
const GLOW = { stiffness: 60, damping: 14 } as const;

/** How far the hovered control pulls the nearest shapes, by kind of control. */
const PULL = { primary: 0.32, control: 0.24, surface: 0.12 } as const;
/** How much a pulled shape grows. */
const GROW = { primary: 0.16, control: 0.12, surface: 0.06 } as const;

/**
 * The state of the shapes behind the page, as plain numbers. The three.js layer only copies it to
 * meshes. Idle: slow drift and a parallax against the cursor. Hovering a control: the two nearest
 * shapes glide towards it and light up while the others make room. A press: the shapes around it are
 * kicked away and flash.
 */
export class OrbField {
  readonly defs: readonly OrbDef[];
  readonly x: Float32Array;
  readonly y: Float32Array;
  /** Size multiplier, 1 at rest. */
  readonly scale: Float32Array;
  /** 0 to 1: how lit the shape is. */
  readonly glow: Float32Array;

  private readonly sx: Spring[];
  private readonly sy: Spring[];
  private readonly ss: Spring[];
  private readonly sg: Spring[];
  private readonly homeX: Float32Array;
  private readonly homeY: Float32Array;
  private readonly pulled = new Uint8Array(2);
  /** False until the first update has placed every shape (so nothing flies in from the corner). */
  private settled = false;

  constructor(defs: readonly OrbDef[]) {
    this.defs = defs;
    const n = defs.length;
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.scale = new Float32Array(n).fill(1);
    this.glow = new Float32Array(n);
    this.homeX = new Float32Array(n);
    this.homeY = new Float32Array(n);
    this.sx = defs.map(() => ({ x: 0, v: 0 }));
    this.sy = defs.map(() => ({ x: 0, v: 0 }));
    this.ss = defs.map(() => ({ x: 1, v: 0 }));
    this.sg = defs.map(() => ({ x: 0, v: 0 }));
  }

  update(dt: number, time: number, input: FieldInput): void {
    const { width, height, pointer, target } = input;
    const unit = Math.min(width, height);
    const n = this.defs.length;
    const px = pointer ? pointer.x / width - 0.5 : 0;
    const py = pointer ? pointer.y / height - 0.5 : 0;

    // resting place of every shape: home, parallax against the cursor, idle drift
    for (let i = 0; i < n; i++) {
      const d = this.defs[i];
      this.homeX[i] =
        d.nx * width -
        px * d.depth * unit * 0.14 +
        Math.sin(time * d.speed + d.phase) * d.amplitude * unit;
      this.homeY[i] =
        d.ny * height -
        py * d.depth * unit * 0.14 +
        Math.cos(time * d.speed * 0.83 + d.phase * 1.7) * d.amplitude * unit;
    }

    // the two shapes closest to the hovered control
    this.pulled[0] = 255;
    this.pulled[1] = 255;
    if (target) {
      let best = Infinity;
      let second = Infinity;
      for (let i = 0; i < n; i++) {
        const dist = Math.hypot(
          target.x - this.homeX[i],
          target.y - this.homeY[i],
        );
        if (dist < best) {
          second = best;
          this.pulled[1] = this.pulled[0];
          best = dist;
          this.pulled[0] = i;
        } else if (dist < second) {
          second = dist;
          this.pulled[1] = i;
        }
      }
    }

    for (let i = 0; i < n; i++) {
      let tx = this.homeX[i];
      let ty = this.homeY[i];
      let ts = 1;
      let tg = 0;

      if (target) {
        const dx = target.x - this.homeX[i];
        const dy = target.y - this.homeY[i];
        if (i === this.pulled[0] || i === this.pulled[1]) {
          tx += dx * PULL[target.kind];
          ty += dy * PULL[target.kind];
          ts = 1 + GROW[target.kind];
          tg = 1;
        } else {
          // everything else makes a little room
          const dist = Math.hypot(dx, dy) || 1;
          const reach = unit * 0.5;
          if (dist < reach) {
            const push = (1 - dist / reach) ** 2 * unit * 0.12;
            tx -= (dx / dist) * push;
            ty -= (dy / dist) * push;
          }
        }
      }

      if (!this.settled) {
        this.sx[i].x = tx;
        this.sy[i].x = ty;
      }

      stepSpring(this.sx[i], tx, POSITION.stiffness, POSITION.damping, dt);
      stepSpring(this.sy[i], ty, POSITION.stiffness, POSITION.damping, dt);
      stepSpring(this.ss[i], ts, SCALE.stiffness, SCALE.damping, dt);
      stepSpring(this.sg[i], tg, GLOW.stiffness, GLOW.damping, dt);
    }
    this.settled = true;

    this.kick(input.bursts, unit);

    for (let i = 0; i < n; i++) {
      this.x[i] = this.sx[i].x;
      this.y[i] = this.sy[i].x;
      this.scale[i] = this.ss[i].x;
      this.glow[i] = Math.min(1.2, Math.max(0, this.sg[i].x));
    }
  }

  /** A press pushes the shapes around it away and makes them flash. */
  private kick(bursts: readonly FxBurst[], unit: number): void {
    const reach = unit * 0.9;
    for (const burst of bursts) {
      for (let i = 0; i < this.defs.length; i++) {
        const dx = this.sx[i].x - burst.x;
        const dy = this.sy[i].x - burst.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist >= reach) continue;
        const falloff = (1 - dist / reach) ** 2;
        const speed = burst.power * falloff * unit * 0.45;
        this.sx[i].v += (dx / dist) * speed;
        this.sy[i].v += (dy / dist) * speed;
        this.ss[i].v += burst.power * falloff * 2.25;
        this.sg[i].x = Math.min(
          1.2,
          this.sg[i].x + burst.power * falloff * 0.45,
        );
      }
    }
  }
}

/** The shapes of the scene. Kept sparse and mostly at the edges: the content stays readable. */
export const ORBS: readonly OrbDef[] = [
  {
    shape: "sphere",
    nx: 0.9,
    ny: 0.2,
    z: -520,
    radius: 0.17,
    depth: 0.7,
    speed: 0.11,
    amplitude: 0.02,
    phase: 0.4,
  },
  {
    shape: "sphere",
    nx: 0.06,
    ny: 0.82,
    z: -400,
    radius: 0.14,
    depth: 0.6,
    speed: 0.09,
    amplitude: 0.025,
    phase: 2.1,
  },
  {
    shape: "gem",
    nx: 0.22,
    ny: 0.16,
    z: -120,
    radius: 0.045,
    depth: 1.1,
    speed: 0.17,
    amplitude: 0.018,
    phase: 4.2,
  },
  {
    shape: "ring",
    nx: 0.62,
    ny: 0.985,
    z: -260,
    radius: 0.075,
    depth: 0.9,
    speed: 0.13,
    amplitude: 0.022,
    phase: 1.3,
  },
  {
    shape: "sphere",
    nx: 0.52,
    ny: 0.07,
    z: 90,
    radius: 0.032,
    depth: 1.3,
    speed: 0.2,
    amplitude: 0.015,
    phase: 5.6,
  },
  {
    shape: "sphere",
    nx: 0.95,
    ny: 0.62,
    z: -700,
    radius: 0.11,
    depth: 0.45,
    speed: 0.08,
    amplitude: 0.02,
    phase: 3.3,
  },
  {
    shape: "gem",
    nx: 0.012,
    ny: 0.4,
    z: -200,
    radius: 0.05,
    depth: 0.95,
    speed: 0.15,
    amplitude: 0.02,
    phase: 0.9,
  },
  {
    shape: "gem",
    nx: 0.36,
    ny: 0.93,
    z: -90,
    radius: 0.04,
    depth: 1.2,
    speed: 0.18,
    amplitude: 0.016,
    phase: 2.8,
  },
];
