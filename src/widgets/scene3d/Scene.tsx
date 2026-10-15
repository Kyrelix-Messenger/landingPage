import { useState, type CSSProperties } from "react";
import { Canvas } from "@react-three/fiber";
import { Effects } from "./Effects";
import { CAMERA_DISTANCE, fovFor } from "./math3d";
import { Orbs } from "./Orbs";
import { PixelCamera } from "./PixelCamera";
import { useInteractionBridge } from "./useInteractionBridge";

const LAYER: CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

/** Glass shapes: behind the page, above the CSS background. */
const BACK: CSSProperties = { ...LAYER, zIndex: -1 };
/** Press effects: above everything, but they never take a click. */
const FRONT: CSSProperties = { ...LAYER, zIndex: 80 };

const GL = {
  alpha: true,
  // The scene sits behind translucent content; MSAA spends a lot of fill rate without a visible gain.
  antialias: false,
  powerPreference: "high-performance",
} as const;

/**
 * Two transparent WebGL canvases (react-three-fiber). The back one is always animating; the front
 * one renders only while an effect is alive. This module is loaded lazily, after the page is up.
 */
export default function Scene() {
  useInteractionBridge();
  // only the starting point: PixelCamera keeps it right on every resize
  const [camera] = useState(() => ({
    position: [0, 0, CAMERA_DISTANCE] as [number, number, number],
    fov: fovFor(window.innerHeight),
    near: 10,
    far: CAMERA_DISTANCE * 4,
  }));

  return (
    <>
      <Canvas
        aria-hidden="true"
        style={BACK}
        flat
        // Keep this decorative full-viewport canvas at CSS-pixel resolution. This cuts its pixel
        // workload by up to 56% on the displays where the former 1.5 DPR cap was reached.
        dpr={1}
        gl={GL}
        camera={camera}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
      >
        <PixelCamera />
        <Orbs />
      </Canvas>
      <Canvas
        aria-hidden="true"
        style={FRONT}
        flat
        dpr={1}
        gl={GL}
        frameloop="demand"
        camera={camera}
        resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
      >
        <PixelCamera />
        <Effects />
      </Canvas>
    </>
  );
}
