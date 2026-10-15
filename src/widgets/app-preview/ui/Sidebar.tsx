import { memo } from "react";
import {
  useFormatTime,
  useTranslation,
  type TranslationKey,
} from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Icon } from "@/shared/ui/icon/Icon";
import {
  PERSON_NAME,
  type ChatDefinition,
  type ChatId,
} from "../model/demoData";
import type { ChatMessage } from "../model/useDemoChat";
import styles from "../AppPreview.module.css";

interface SidebarProps {
  title: TranslationKey;
  chats: readonly ChatDefinition[];
  activeId: ChatId;
  messages: Record<ChatId, ChatMessage[]>;
  unread: Record<ChatId, number>;
  /** The chat whose other side is typing right now. */
  typing: ChatId | null;
  query: string;
  onQuery: (value: string) => void;
  onOpen: (id: ChatId) => void;
}

/** The chat list panel: title, search and the rows. */
export const Sidebar = memo(function Sidebar({
  title,
  chats,
  activeId,
  messages,
  unread,
  typing,
  query,
  onQuery,
  onOpen,
}: SidebarProps) {
  const { t } = useTranslation();
  const format = useFormatTime();
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? chats.filter((chat) => t(chat.name).toLowerCase().includes(needle))
    : chats;

  return (
    <section className={cn(styles.panel, styles.sidebar)} data-anchor="list">
      <header className={styles.sidebarHead}>
        <h3 className={styles.sidebarTitle}>{t(title)}</h3>
        <label className={styles.search}>
          <Icon name="search" size="1.125rem" />
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder={t("demo.search")}
            aria-label={t("demo.search")}
            autoComplete="off"
            onChange={(event) => onQuery(event.target.value)}
          />
        </label>
      </header>

      {visible.length === 0 ? (
        <p className={styles.empty}>{t("demo.empty")}</p>
      ) : (
        <ul className={styles.chatList}>
          {visible.map((chat) => {
            const last = messages[chat.id].at(-1);
            const isTyping = typing === chat.id;
            // nothing is shown that the conversation has not shown yet (no spoilers)
            const preview = last
              ? "key" in last.text
                ? t(last.text.key)
                : last.text.raw
              : "";
            const from = last?.sender;
            const showSender = chat.kind === "group" && from && !isTyping;
            const time = last?.at;
            return (
              <li key={chat.id}>
                <button
                  type="button"
                  className={cn(
                    styles.row,
                    chat.id === activeId && styles.rowActive,
                  )}
                  aria-current={chat.id === activeId ? "true" : undefined}
                  onClick={() => onOpen(chat.id)}
                >
                  <Avatar name={t(chat.name)} tone={chat.tone} size="3rem" />
                  <span className={styles.rowBody}>
                    <span className={styles.rowTop}>
                      <span className={styles.rowName}>{t(chat.name)}</span>
                      <span
                        key={last?.id}
                        className={cn(
                          styles.rowTime,
                          last?.fresh && styles.previewIn,
                        )}
                      >
                        {time ? format(time) : ""}
                      </span>
                    </span>
                    <span className={styles.rowBottom}>
                      <span
                        key={isTyping ? "typing" : last?.id}
                        className={cn(
                          styles.rowPreview,
                          isTyping && styles.rowTyping,
                          (isTyping || last?.fresh) && styles.previewIn,
                        )}
                      >
                        {isTyping ? (
                          t("demo.typing")
                        ) : (
                          <>
                            {showSender ? `${t(PERSON_NAME[from])}: ` : ""}
                            {preview}
                          </>
                        )}
                      </span>
                      {unread[chat.id] > 0 && (
                        <span
                          key={unread[chat.id]}
                          className={cn(styles.badge, styles.badgePop)}
                        >
                          {unread[chat.id]}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});
