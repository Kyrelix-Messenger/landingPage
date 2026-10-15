import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type Mesh, type ShaderMaterial } from "three";
import { burstsAfter, fx } from "@/shared/lib/fx";
import { useThemeStore } from "@/shared/theme";
import { depthScale } from "./math3d";
import { ORBS, OrbField, type OrbShape } from "./orbField";
import { PALETTE } from "./palette";
import { ORB_FRAGMENT, ORB_VERTEX } from "./shaders";

function Geometry({ shape }: { shape: OrbShape }) {
  switch (shape) {
    case "gem":
      // detail 0: flat facets, so the rim light reads as a cut stone
      return <icosahedronGeometry args={[1, 0]} />;
    case "ring":
      return <torusGeometry args={[1, 0.2, 32, 96]} />;
    default:
      return <sphereGeometry args={[1, 64, 48]} />;
  }
}

function makeUniforms() {
  const palette = PALETTE[useThemeStore.getState().theme];
  return {
    uColorA: { value: new Color(palette.orbA) },
    uColorB: { value: new Color(palette.orbB) },
    uGlow: { value: 0 },
    uDark: { value: palette.dark },
    uTime: { value: 0 },
    uAlpha: { value: 1 },
  };
}

/**
 * The glass shapes behind the page. They drift on their own, lean away from the cursor, glide to the
 * control you hover and flash when you press (all of that is OrbField; this only draws it).
 */
export function Orbs() {
  const field = useMemo(() => new OrbField(ORBS), []);
  const meshes = useRef<(Mesh | null)[]>([]);
  const materials = useRef<(ShaderMaterial | null)[]>([]);
  const uniforms = useMemo(() => ORBS.map(makeUniforms), []);
  const cursor = useRef(0);
  const goal = useMemo(() => ({ a: new Color(), b: new Color() }), []);

  useEffect(() => {
    cursor.current = fx.lastId;
  }, []);

  // Someone who asked for less transparency gets denser glass on the page (see tokens.css); the
  // shapes behind it fade to half, so they cannot wash the text out through that glass.
  const dim = useRef(1);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-transparency: reduce)");
    const update = () => {
      dim.current = query.matches ? 0.5 : 1;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const { width, height } = state.size;
    const fresh = burstsAfter(cursor.current);
    if (fresh.length) cursor.current = fresh[fresh.length - 1].id;

    field.update(dt, state.clock.elapsedTime, {
      width,
      height,
      pointer: fx.pointer,
      target: fx.target,
      bursts: fresh,
    });

    const palette = PALETTE[useThemeStore.getState().theme];
    goal.a.set(palette.orbA);
    goal.b.set(palette.orbB);
    const blend = 1 - Math.exp(-4 * dt);
    const unit = Math.min(width, height);

    for (let i = 0; i < ORBS.length; i++) {
      const def = ORBS[i];
      const mesh = meshes.current[i];
      const material = materials.current[i];
      if (!mesh || !material) continue;

      const k = depthScale(def.z);
      mesh.position.set(
        (field.x[i] - width / 2) * k,
        (height / 2 - field.y[i]) * k,
        def.z,
      );
      mesh.scale.setScalar(unit * def.radius * field.scale[i] * k);
      mesh.rotation.y += dt * (0.12 + (i % 3) * 0.06);
      mesh.rotation.x += dt * (0.05 + (i % 2) * 0.05);

      const u = material.uniforms;
      u.uGlow.value = field.glow[i];
      u.uTime.value = state.clock.elapsedTime;
      u.uAlpha.value += (dim.current - u.uAlpha.value) * blend;
      u.uDark.value += (palette.dark - u.uDark.value) * blend;
      (u.uColorA.value as Color).lerp(goal.a, blend);
      (u.uColorB.value as Color).lerp(goal.b, blend);
    }
  });

  return (
    <>
      {ORBS.map((def, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            meshes.current[i] = mesh;
          }}
          renderOrder={Math.round(-def.z)}
        >
          <Geometry shape={def.shape} />
          <shaderMaterial
            ref={(material) => {
              materials.current[i] = material;
            }}
            vertexShader={ORB_VERTEX}
            fragmentShader={ORB_FRAGMENT}
            uniforms={uniforms[i]}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}
