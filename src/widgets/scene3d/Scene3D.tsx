import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ReactNode,
  memo,
} from "react";
import { useReducedMotion } from "framer-motion";

// three.js and react-three-fiber are a separate chunk: they load after the page is interactive
const Scene = lazy(() => import("./Scene"));

/** WebGL is optional: whatever goes wrong, the page simply keeps its CSS background. */
class Fallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function canUseWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return !!(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Devices that should not pay for decoration: data saver, very few cores. */
function isConstrained(): boolean {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return (
    connection?.saveData === true ||
    (navigator.hardwareConcurrency !== undefined &&
      navigator.hardwareConcurrency <= 2)
  );
}

/**
 * The 3D layer: glass shapes behind the page that react to the cursor and to the controls you use,
 * and press effects on top. Skipped for "reduced motion" (it is all movement), without WebGL and on
 * constrained devices. It loads during idle time, never blocking the first paint.
 */
export const Scene3D = memo(function Scene3D() {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion || isConstrained() || !canUseWebGL()) return;
    const start = () => setReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 1200);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  if (reducedMotion || !ready) return null;
  return (
    <Fallback>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Fallback>
  );
});
