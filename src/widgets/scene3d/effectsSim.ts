import { easeOutCubic } from "./math3d";

/** World units here are CSS pixels on the z = 0 plane, x to the right and y UP (see math3d.ts). */

export const MAX_RINGS = 8;
export const MAX_SHARDS = 112;

export interface Ring {
  alive: boolean;
  age: number;
  duration: number;
  x: number;
  y: number;
  /** Radius at the end of its life, in pixels. */
  max: number;
  /** Rotation about x (a ring seen at an angle reads as a 3D ripple) and about z. */
  tilt: number;
  roll: number;
  /** Wide and faint, under the thin bright one. */
  soft: boolean;
}

const GRAVITY = 640;
const DRAG = 2.1;

/**
 * Short-lived effects of a press: ripples that expand in 3D and tumbling shards. Pure numbers; the
 * three.js layer copies them to meshes and asks `active` whether another frame is needed.
 */
export class EffectsSim {
  readonly rings: Ring[] = Array.from({ length: MAX_RINGS }, () => ({
    alive: false,
    age: 0,
    duration: 1,
    x: 0,
    y: 0,
    max: 1,
    tilt: 0,
    roll: 0,
    soft: false,
  }));

  readonly alive = new Uint8Array(MAX_SHARDS);
  readonly px = new Float32Array(MAX_SHARDS);
  readonly py = new Float32Array(MAX_SHARDS);
  readonly pz = new Float32Array(MAX_SHARDS);
  readonly rx = new Float32Array(MAX_SHARDS);
  readonly ry = new Float32Array(MAX_SHARDS);
  readonly rz = new Float32Array(MAX_SHARDS);
  /** Current size in pixels (already shrinking towards the end of the shard's life). */
  readonly size = new Float32Array(MAX_SHARDS);
  /** Index into the palette. */
  readonly tone = new Uint8Array(MAX_SHARDS);

  private readonly vx = new Float32Array(MAX_SHARDS);
  private readonly vy = new Float32Array(MAX_SHARDS);
  private readonly vz = new Float32Array(MAX_SHARDS);
  private readonly wx = new Float32Array(MAX_SHARDS);
  private readonly wy = new Float32Array(MAX_SHARDS);
  private readonly wz = new Float32Array(MAX_SHARDS);
  private readonly age = new Float32Array(MAX_SHARDS);
  private readonly life = new Float32Array(MAX_SHARDS);
  private readonly base = new Float32Array(MAX_SHARDS);
  private nextRing = 0;
  private nextShard = 0;

  /** True while something is still moving: the layer keeps rendering until this turns false. */
  busy = false;

  /** A press at world point (x, y). Power 0 to 1 sets the size and the number of shards. */
  burst(
    x: number,
    y: number,
    power: number,
    random: () => number = Math.random,
  ): void {
    const p = Math.min(1, Math.max(0.1, power));

    this.spawnRing(x, y, 90 + 170 * p, 0.85, random, false);
    this.spawnRing(x, y, 130 + 250 * p, 1.05, random, true);

    const count = Math.round(8 + 16 * p);
    for (let n = 0; n < count; n++) {
      const i = this.nextShard;
      this.nextShard = (this.nextShard + 1) % MAX_SHARDS;
      const theta = random() * Math.PI * 2;
      const speed = (170 + random() * 380) * (0.5 + p * 0.7);
      this.alive[i] = 1;
      this.px[i] = x;
      this.py[i] = y;
      this.pz[i] = 0;
      this.vx[i] = Math.cos(theta) * speed;
      this.vy[i] = Math.sin(theta) * speed + 90 * p;
      this.vz[i] = (random() - 0.35) * 320 * p;
      this.rx[i] = random() * 6.28;
      this.ry[i] = random() * 6.28;
      this.rz[i] = random() * 6.28;
      this.wx[i] = (random() - 0.5) * 16;
      this.wy[i] = (random() - 0.5) * 16;
      this.wz[i] = (random() - 0.5) * 16;
      this.age[i] = 0;
      this.life[i] = 0.65 + random() * 0.55;
      this.base[i] = (5 + random() * 9) * (0.65 + p * 0.5);
      this.size[i] = this.base[i];
      this.tone[i] = Math.floor(random() * 4);
    }
    this.busy = true;
  }

  private spawnRing(
    x: number,
    y: number,
    max: number,
    duration: number,
    random: () => number,
    soft: boolean,
  ): void {
    const ring = this.rings[this.nextRing];
    this.nextRing = (this.nextRing + 1) % MAX_RINGS;
    ring.alive = true;
    ring.age = 0;
    ring.duration = duration;
    ring.x = x;
    ring.y = y;
    ring.max = max;
    ring.tilt = 0.85 + random() * 0.5;
    ring.roll = random() * Math.PI * 2;
    ring.soft = soft;
  }

  /** Progress of a ring, 0 to 1. */
  ringProgress(ring: Ring): number {
    return Math.min(1, ring.age / ring.duration);
  }

  /** Radius of a ring now. */
  ringRadius(ring: Ring): number {
    return Math.max(1, easeOutCubic(this.ringProgress(ring)) * ring.max);
  }

  /** Opacity of a ring now (the soft one is fainter). */
  ringOpacity(ring: Ring): number {
    const t = this.ringProgress(ring);
    return (1 - t) ** 1.6 * (ring.soft ? 0.3 : 0.95);
  }

  update(dt: number): void {
    let busy = false;

    for (const ring of this.rings) {
      if (!ring.alive) continue;
      ring.age += dt;
      if (ring.age >= ring.duration) ring.alive = false;
      else busy = true;
    }

    const drag = Math.exp(-DRAG * dt);
    for (let i = 0; i < MAX_SHARDS; i++) {
      if (!this.alive[i]) continue;
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) {
        this.alive[i] = 0;
        this.size[i] = 0;
        continue;
      }
      busy = true;
      this.vx[i] *= drag;
      this.vy[i] = this.vy[i] * drag - GRAVITY * dt;
      this.vz[i] *= drag;
      this.px[i] += this.vx[i] * dt;
      this.py[i] += this.vy[i] * dt;
      this.pz[i] += this.vz[i] * dt;
      this.rx[i] += this.wx[i] * dt;
      this.ry[i] += this.wy[i] * dt;
      this.rz[i] += this.wz[i] * dt;
      this.size[i] = this.base[i] * (1 - this.age[i] / this.life[i]) ** 0.8;
    }

    this.busy = busy;
  }
}
