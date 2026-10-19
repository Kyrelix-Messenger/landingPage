import { memo } from "react";
import styles from "./SiteBackground.module.css";

/**
 * The messenger's static page gradient, one layer per theme, cross-faded on theme change.
 */
export const SiteBackground = memo(function SiteBackground() {
  return (
    <div className={styles.root} aria-hidden="true">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} className={styles.layer} data-theme={theme}>
          <div className={`${styles.position} ${styles.topRight}`}>
            <div className={`${styles.sphere} ${styles.sphereA}`} />
          </div>
          <div className={`${styles.position} ${styles.bottomLeft}`}>
            <div className={`${styles.sphere} ${styles.sphereB}`} />
          </div>
        </div>
      ))}
    </div>
  );
});
