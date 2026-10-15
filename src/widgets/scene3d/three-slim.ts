/**
 * The part of three.js this site uses, and nothing else.
 *
 * @react-three/fiber does `import * as THREE from "three"` and registers all of it
 * (`extend(THREE)`), so a normal build keeps the whole library. In production builds
 * vite.config.ts points every import of "three" (from the app and from react-three-fiber) here,
 * and this file imports only what is listed, so the bundler can drop the rest.
 *
 * Needed when something new shows up in the scene: a new JSX element (`<boxGeometry>` needs
 * BoxGeometry), a new import from "three", or a new "THREE.x" inside react-three-fiber after an
 * upgrade. A missing name fails at runtime with "R3F: Invalid constructor", so check the 3D layer in
 * a production build (`npm run build && npm run preview`).
 */

// used by react-three-fiber itself
export {
  ACESFilmicToneMapping,
  BasicShadowMap,
  Clock,
  Color,
  ColorManagement,
  Layers,
  LinearSRGBColorSpace,
  NoToneMapping,
  Object3D,
  OrthographicCamera,
  PCFShadowMap,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  UnsignedByteType,
  Vector2,
  Vector3,
  VSMShadowMap,
  WebGLRenderer,
} from "three";

// used by the scene, as JSX elements (react-three-fiber looks them up by name) and as imports
export {
  AmbientLight,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
} from "three";
