import { useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/ui/icon/Icon";
import type { Section } from "../model/demoData";
import styles from "../AppPreview.module.css";

interface RailProps {
  section: Section;
  unreadGroups: number;
  onSection: (section: Section) => void;
  onSwapSide: () => void;
  /** Switches the theme of the window only, not of the page. */
  onToggleTheme: () => void;
}

/** The messenger's navigation rail. Its theme button is local to the window. */
export function Rail({
  section,
  unreadGroups,
  onSection,
  onSwapSide,
  onToggleTheme,
}: RailProps) {
  const { t } = useTranslation();

  const item = (target: Section, icon: IconName, label: string, badge = 0) => (
    <button
      type="button"
      className={cn(styles.railButton, section === target && styles.railActive)}
      aria-label={label}
      title={label}
      aria-current={section === target ? "true" : undefined}
      onClick={() => onSection(target)}
    >
      <Icon name={icon} size="1.5rem" strokeWidth={1.5} />
      {badge > 0 && <span className={styles.railBadge}>{badge}</span>}
    </button>
  );

  return (
    <nav className={cn(styles.panel, styles.rail)} aria-label="Kyrelix">
      <div className={styles.railLogo} aria-hidden="true">
        <Icon name="chat" size="1.5rem" strokeWidth={2} />
      </div>
      <div className={styles.railNav}>
        <span className={styles.railIdle} aria-hidden="true">
          <Icon name="profile" size="1.5rem" strokeWidth={1.5} />
        </span>
        <span className={styles.railIdle} aria-hidden="true">
          <Icon name="newGroup" size="1.625rem" />
        </span>
        {item("chats", "chat", t("demo.railChats"))}
        {item("groups", "groups", t("demo.groups"), unreadGroups)}
        {item("calls", "calls", t("demo.calls"))}
      </div>
      <div className={styles.railFoot}>
        <button
          type="button"
          className={styles.railButton}
          aria-label={t("demo.theme")}
          title={t("demo.theme")}
          onClick={onToggleTheme}
        >
          <Icon
            name="moon"
            size="1.5rem"
            strokeWidth={1.5}
            className={styles.moon}
          />
          <Icon
            name="sun"
            size="1.5rem"
            strokeWidth={1.5}
            className={styles.sun}
          />
        </button>
        <button
          type="button"
          className={styles.railButton}
          aria-label={t("demo.side")}
          title={t("demo.side")}
          onClick={onSwapSide}
        >
          <Icon name="settings" size="1.5rem" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
}
