import { useTranslation } from "@/shared/i18n";
import { useThemeStore } from "@/shared/theme";
import { Icon } from "@/shared/ui/icon/Icon";
import styles from "./ThemeToggle.module.css";

/** Round switch, like the messenger's rail button: it shows the theme it will switch to. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={t("header.theme")}
      title={t("header.theme")}
      className={styles.toggle}
      onClick={toggle}
    >
      <Icon name="moon" size="1.375rem" className={styles.moon} />
      <Icon name="sun" size="1.375rem" className={styles.sun} />
    </button>
  );
}
