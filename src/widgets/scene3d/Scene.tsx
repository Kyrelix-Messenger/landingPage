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
  antialias: true,
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
        dpr={[1, 1.5]}
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
        dpr={[1, 1.5]}
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
