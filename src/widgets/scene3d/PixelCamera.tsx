import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { CAMERA_DISTANCE, fovFor } from "./math3d";

/**
 * Makes the z = 0 plane map one world unit to one CSS pixel, whatever the viewport height is, so
 * the scene can be laid out in screen coordinates. Done inside the frame loop (and only when the
 * height changes), because a camera is three.js state, not React state.
 */
export function PixelCamera() {
  const height = useRef(0);
  useFrame((state) => {
    if (height.current === state.size.height) return;
    height.current = state.size.height;
    const camera = state.camera as PerspectiveCamera;
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.fov = fovFor(state.size.height);
    camera.near = 10;
    camera.far = CAMERA_DISTANCE * 4;
    camera.updateProjectionMatrix();
  });
  return null;
}
