import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  Object3D,
  SRGBColorSpace,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
} from "three";
import { burstsAfter, fx, onFxWake } from "@/shared/lib/fx";
import { useThemeStore } from "@/shared/theme";
import { EffectsSim, MAX_RINGS, MAX_SHARDS } from "./effectsSim";
import { PALETTE } from "./palette";

/** A soft glowing ring on a transparent square: no hard edge, unlike a flat geometric ring. */
function makeGlowRing(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.28,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.62, "rgba(255,255,255,0.85)");
    gradient.addColorStop(0.8, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * What a press does: two ripples that expand at an angle (so they read as a disc in 3D) and a
 * handful of lit shards that tumble out and fall. It renders only while something is moving.
 */
export function Effects() {
  const sim = useMemo(() => new EffectsSim(), []);
  const glow = useMemo(() => makeGlowRing(), []);
  const dummy = useMemo(() => new Object3D(), []);
  const tint = useMemo(() => new Color(), []);
  const rings = useRef<(Mesh | null)[]>([]);
  const shards = useRef<InstancedMesh>(null);
  const cursor = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    cursor.current = fx.lastId;
    return onFxWake(() => invalidate());
  }, [invalidate]);

  useEffect(() => () => glow.dispose(), [glow]);

  useFrame((state, delta) => {
    const { width, height } = state.size;
    for (const burst of burstsAfter(cursor.current)) {
      cursor.current = burst.id;
      sim.burst(burst.x - width / 2, height / 2 - burst.y, burst.power);
    }
    sim.update(Math.min(delta, 0.05));

    const palette = PALETTE[useThemeStore.getState().theme];

    for (let i = 0; i < MAX_RINGS; i++) {
      const mesh = rings.current[i];
      if (!mesh) continue;
      const ring = sim.rings[i];
      mesh.visible = ring.alive;
      if (!ring.alive) continue;
      const radius = sim.ringRadius(ring);
      mesh.position.set(ring.x, ring.y, 0);
      mesh.rotation.set(ring.tilt, 0, ring.roll);
      mesh.scale.setScalar(radius);
      const material = mesh.material as MeshBasicMaterial;
      material.opacity = sim.ringOpacity(ring);
      material.color.set(palette.ring);
    }

    const instances = shards.current;
    if (instances) {
      for (let i = 0; i < MAX_SHARDS; i++) {
        if (sim.alive[i]) {
          dummy.position.set(sim.px[i], sim.py[i], sim.pz[i]);
          dummy.rotation.set(sim.rx[i], sim.ry[i], sim.rz[i]);
          dummy.scale.setScalar(sim.size[i]);
          instances.setColorAt(i, tint.set(palette.shards[sim.tone[i]]));
        } else {
          dummy.scale.setScalar(0);
        }
        dummy.updateMatrix();
        instances.setMatrixAt(i, dummy.matrix);
      }
      instances.instanceMatrix.needsUpdate = true;
      if (instances.instanceColor) instances.instanceColor.needsUpdate = true;
    }

    if (sim.busy) state.invalidate();
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[-400, 600, 800]} intensity={2.6} />
      <directionalLight
        position={[600, -300, 400]}
        intensity={0.9}
        color="#a5b4fc"
      />

      {Array.from({ length: MAX_RINGS }, (_, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            rings.current[i] = mesh;
          }}
          visible={false}
          frustumCulled={false}
        >
          {/* even slots are the thin bright ring, odd slots the soft wide one (see EffectsSim) */}
          {i % 2 === 0 ? (
            <ringGeometry args={[0.96, 1, 128]} />
          ) : (
            <planeGeometry args={[2.4, 2.4]} />
          )}
          <meshBasicMaterial
            map={i % 2 === 0 ? null : glow}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={DoubleSide}
          />
        </mesh>
      ))}

      <instancedMesh
        ref={shards}
        args={[undefined, undefined, MAX_SHARDS]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading metalness={0.25} roughness={0.35} />
      </instancedMesh>
    </>
  );
}
