import { LOGO_PATH, LOGO_VIEWBOX } from "./logoPath";
import styles from "./Brand.module.css";

/** The Kyrelix mark (drawn in the text colour, so it follows the theme) and the wordmark. */
export function Brand({ href = "#top" }: { href?: string }) {
  return (
    <a className={styles.brand} href={href} aria-label="Kyrelix">
      <svg
        className={styles.mark}
        viewBox={LOGO_VIEWBOX}
        aria-hidden="true"
        focusable="false"
      >
        <path d={LOGO_PATH} fill="currentColor" />
      </svg>
      <span className={styles.name} translate="no">
        Kyrelix
      </span>
    </a>
  );
}
