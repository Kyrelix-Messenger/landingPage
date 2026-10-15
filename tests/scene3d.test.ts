import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { burstsAfter, emitBurst, fx, onFxWake } from "../src/shared/lib/fx.ts";
import { EffectsSim, MAX_SHARDS } from "../src/widgets/scene3d/effectsSim.ts";
import {
  CAMERA_DISTANCE,
  depthScale,
  easeOutCubic,
  fovFor,
  seeded,
  stepSpring,
} from "../src/widgets/scene3d/math3d.ts";
import { ORBS, OrbField } from "../src/widgets/scene3d/orbField.ts";

const VIEW = { width: 1600, height: 900 };

function run(
  field: OrbField,
  seconds: number,
  input: Partial<Parameters<OrbField["update"]>[2]> = {},
) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) {
    field.update(dt, t, {
      ...VIEW,
      pointer: null,
      target: null,
      bursts: [],
      ...input,
    });
  }
}

describe("projection helpers", () => {
  it("maps one world unit to one pixel on the z = 0 plane", () => {
    const fov = fovFor(900);
    const halfHeight = Math.tan((fov * Math.PI) / 360) * CAMERA_DISTANCE;
    assert.ok(Math.abs(halfHeight - 450) < 1e-9);
  });

  it("keeps the apparent size of shapes at any depth", () => {
    assert.equal(depthScale(0), 1);
    assert.equal(depthScale(-CAMERA_DISTANCE), 2);
    assert.equal(depthScale(CAMERA_DISTANCE / 2), 0.5);
  });

  it("eases out and stays in range", () => {
    assert.equal(easeOutCubic(0), 0);
    assert.equal(easeOutCubic(1), 1);
    assert.equal(easeOutCubic(2), 1);
    assert.ok(easeOutCubic(0.5) > 0.5);
  });
});

describe("spring", () => {
  it("settles on its target", () => {
    const spring = { x: 0, v: 0 };
    for (let i = 0; i < 600; i++) stepSpring(spring, 100, 34, 7, 1 / 60);
    assert.ok(Math.abs(spring.x - 100) < 0.01);
    assert.ok(Math.abs(spring.v) < 0.01);
  });
});

describe("seeded random", () => {
  it("repeats for the same seed and stays in [0, 1)", () => {
    const a = seeded(7);
    const b = seeded(7);
    for (let i = 0; i < 50; i++) {
      const value = a();
      assert.equal(value, b());
      assert.ok(value >= 0 && value < 1);
    }
    assert.notEqual(seeded(7)(), seeded(8)());
  });
});

describe("orb field", () => {
  it("places the shapes at their homes on the first update, with no fly-in", () => {
    const field = new OrbField(ORBS);
    field.update(1 / 60, 0, {
      ...VIEW,
      pointer: null,
      target: null,
      bursts: [],
    });
    ORBS.forEach((def, i) => {
      const drift = def.amplitude * Math.min(VIEW.width, VIEW.height) * 2;
      assert.ok(Math.abs(field.x[i] - def.nx * VIEW.width) <= drift + 1);
      assert.ok(Math.abs(field.y[i] - def.ny * VIEW.height) <= drift + 1);
      assert.equal(field.scale[i], 1);
    });
  });

  it("pulls the nearest shape to a hovered control and lights it", () => {
    const idle = new OrbField(ORBS);
    const hovered = new OrbField(ORBS);
    const target = {
      x: 1400,
      y: 150,
      width: 200,
      height: 56,
      kind: "primary" as const,
    };
    run(idle, 2);
    run(hovered, 2, { target });
    // shape 0 lives at the top right, right next to that target
    const before = Math.hypot(target.x - idle.x[0], target.y - idle.y[0]);
    const after = Math.hypot(target.x - hovered.x[0], target.y - hovered.y[0]);
    assert.ok(after < before, `${after} should be less than ${before}`);
    assert.ok(hovered.glow[0] > 0.8);
    assert.ok(hovered.scale[0] > idle.scale[0]);
  });

  it("settles back when the cursor leaves", () => {
    const field = new OrbField(ORBS);
    const target = {
      x: 1400,
      y: 150,
      width: 200,
      height: 56,
      kind: "control" as const,
    };
    run(field, 1.5, { target });
    run(field, 4);
    assert.ok(field.glow[0] < 0.05);
    assert.ok(Math.abs(field.scale[0] - 1) < 0.02);
  });

  it("kicks the shapes around a press away from it", () => {
    const calm = new OrbField(ORBS);
    const kicked = new OrbField(ORBS);
    const burst = { id: 1, x: 1440, y: 180, power: 1 };
    run(calm, 0.3);
    run(kicked, 0.1);
    kicked.update(1 / 60, 0.1, {
      ...VIEW,
      pointer: null,
      target: null,
      bursts: [burst],
    });
    run(kicked, 0.2);
    const gap = (f: OrbField) => Math.hypot(f.x[0] - burst.x, f.y[0] - burst.y);
    assert.ok(gap(kicked) > gap(calm));
  });
});

describe("press effects", () => {
  it("spawn two ripples and a handful of shards, then die out", () => {
    const sim = new EffectsSim();
    sim.burst(0, 0, 1, seeded(3));
    assert.equal(sim.rings.filter((ring) => ring.alive).length, 2);
    const shards = sim.alive.reduce((sum, value) => sum + value, 0);
    assert.ok(shards >= 8 && shards <= MAX_SHARDS);
    assert.ok(sim.busy);

    for (let i = 0; i < 180; i++) sim.update(1 / 60);
    assert.equal(sim.busy, false);
    assert.equal(sim.rings.filter((ring) => ring.alive).length, 0);
    assert.equal(
      sim.alive.reduce((sum, value) => sum + value, 0),
      0,
    );
  });

  it("expands and fades the ripples", () => {
    const sim = new EffectsSim();
    sim.burst(0, 0, 1, seeded(1));
    const ring = sim.rings[0];
    const r0 = sim.ringRadius(ring);
    const o0 = sim.ringOpacity(ring);
    sim.update(0.3);
    assert.ok(sim.ringRadius(ring) > r0);
    assert.ok(sim.ringOpacity(ring) < o0);
  });

  it("a stronger press throws more shards and wider ripples", () => {
    const weak = new EffectsSim();
    const strong = new EffectsSim();
    weak.burst(0, 0, 0.2, seeded(5));
    strong.burst(0, 0, 1, seeded(5));
    const count = (sim: EffectsSim) =>
      sim.alive.reduce((sum, value) => sum + value, 0);
    assert.ok(count(strong) > count(weak));
    assert.ok(strong.rings[0].max > weak.rings[0].max);
  });

  it("shards fall and shrink", () => {
    const sim = new EffectsSim();
    sim.burst(0, 0, 0.5, seeded(9));
    const i = sim.alive.findIndex((value) => value === 1);
    const startSize = sim.size[i];
    for (let step = 0; step < 30; step++) sim.update(1 / 60);
    assert.ok(sim.size[i] < startSize);
    assert.ok(sim.py[i] < 200);
  });
});

describe("interaction bus", () => {
  it("gives every burst an increasing id and lets each layer read from its own cursor", () => {
    const start = fx.lastId;
    emitBurst(10, 20, 0.5);
    emitBurst(30, 40, 1);
    const seen = burstsAfter(start);
    assert.equal(seen.length, 2);
    assert.equal(seen[0].id, start + 1);
    assert.equal(seen[1].id, start + 2);
    assert.equal(burstsAfter(start + 1).length, 1);
    assert.equal(burstsAfter(start + 2).length, 0);
  });

  it("wakes the effect layer and keeps only the latest bursts", () => {
    let woken = 0;
    const off = onFxWake(() => {
      woken += 1;
    });
    for (let i = 0; i < 20; i++) emitBurst(i, i);
    off();
    emitBurst(0, 0);
    assert.equal(woken, 20);
    assert.ok(fx.bursts.length <= 12);
  });
});
