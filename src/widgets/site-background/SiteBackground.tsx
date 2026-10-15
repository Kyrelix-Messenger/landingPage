import { memo } from "react";
import { m, useTransform } from "framer-motion";
import { usePointerSpring } from "@/shared/lib/pointer";
import styles from "./SiteBackground.module.css";

/**
 * The messenger's page background: a gradient with two big blurred spheres, one layer per theme
 * (cross-faded on theme change). The spheres drift against the cursor, so the page and the
 * preview in the hero react to the same mouse.
 */
export const SiteBackground = memo(function SiteBackground() {
  const { x, y } = usePointerSpring();
  const farX = useTransform(x, (v) => v * -90);
  const farY = useTransform(y, (v) => v * -70);
  const nearX = useTransform(x, (v) => v * 130);
  const nearY = useTransform(y, (v) => v * 100);

  return (
    <div className={styles.root} aria-hidden="true">
      {(["light", "dark"] as const).map((theme) => (
        <div
          key={theme}
          className={
            theme === "dark" ? `${styles.layer} ${styles.dark}` : styles.layer
          }
          data-theme={theme}
        >
          <m.div
            className={`${styles.mover} ${styles.topRight}`}
            style={{ x: farX, y: farY }}
          >
            <div className={`${styles.sphere} ${styles.sphereA}`} />
          </m.div>
          <m.div
            className={`${styles.mover} ${styles.bottomLeft}`}
            style={{ x: nearX, y: nearY }}
          >
            <div className={`${styles.sphere} ${styles.sphereB}`} />
          </m.div>
        </div>
      ))}
    </div>
  );
});
