import { Icon } from "@/shared/ui/icon/Icon";
import styles from "./Brand.module.css";

/** Logo: the messenger's chat-bubble glyph on its avatar gradient, plus the wordmark. */
export function Brand({ href = "#top" }: { href?: string }) {
  return (
    <a className={styles.brand} href={href} aria-label="Kyrelix">
      <span className={styles.mark} aria-hidden="true">
        <Icon name="chat" size="1.25rem" strokeWidth={2} />
      </span>
      <span className={styles.name} translate="no">
        Kyrelix
      </span>
    </a>
  );
}
