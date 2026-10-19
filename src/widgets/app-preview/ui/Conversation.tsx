import {
  memo,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useFormatTime, useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Bubble } from "@/shared/ui/bubble/Bubble";
import { Icon } from "@/shared/ui/icon/Icon";
import { PERSON_NAME, type ChatDefinition } from "../model/demoData";
import type { ChatMessage } from "../model/useDemoChat";
import styles from "../AppPreview.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const LAND = {
  type: "spring",
  stiffness: 340,
  damping: 28,
  mass: 0.9,
} as const;

interface SlotProps {
  own?: boolean;
  /** Arrived just now: grows into place and the bubble settles with a small spring. */
  fresh: boolean;
  hidden?: boolean;
  children: ReactNode;
}

/**
 * One row of the conversation. The row grows from zero height, so everything above it slides up
 * smoothly instead of jumping, while the bubble itself rises and settles. Heights are animated
 * independently of the surrounding window and panel layout.
 */
function Slot({ own, fresh, hidden, children }: SlotProps) {
  const reduced = useReducedMotion();
  return (
    <m.div
      className={cn(styles.slot, own && styles.slotOwn)}
      initial={fresh ? { height: reduced ? "auto" : 0, opacity: 0 } : false}
      animate={{ height: "auto", opacity: 1 }}
      exit={{
        height: reduced ? "auto" : 0,
        opacity: 0,
        transition: { duration: 0.24, ease: EASE },
      }}
      transition={{
        height: { duration: 0.46, ease: EASE },
        opacity: { duration: 0.32, ease: "easeOut" },
      }}
      aria-hidden={hidden || undefined}
    >
      <m.div
        className={styles.message}
        initial={fresh && !reduced ? { y: 20, scale: 0.9 } : false}
        animate={{ y: 0, scale: 1 }}
        transition={LAND}
      >
        {children}
      </m.div>
    </m.div>
  );
}

interface ConversationProps {
  chat: ChatDefinition;
  messages: readonly ChatMessage[];
  typing: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
  /** Frozen copies in the theme comparison never change, so they do not need a ResizeObserver. */
  followMessages?: boolean;
}

/** Header, message history and composer of the open chat. */
export const Conversation = memo(function Conversation({
  chat,
  messages,
  typing,
  onSend,
  onBack,
  followMessages = true,
}: ConversationProps) {
  const { t } = useTranslation();
  const format = useFormatTime();
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  // the draft is local: typing re-renders only this panel, not the whole window
  const [draft, setDraft] = useState("");

  // Keep the newest message in view while rows grow: follow the list's height frame by frame
  // (a one-off smooth scroll would only reach the height the list had when it started).
  useEffect(() => {
    if (!followMessages) return;
    const box = scroller.current;
    const content = list.current;
    if (!box || !content) return;
    pinned.current = true;
    const toBottom = () => {
      box.scrollTop = box.scrollHeight;
    };
    toBottom();
    const observer = new ResizeObserver(() => {
      if (pinned.current) toBottom();
    });
    observer.observe(content);
    const onScroll = () => {
      pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight < 32;
    };
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      box.removeEventListener("scroll", onScroll);
    };
  }, [chat.id, followMessages]);

  const status =
    chat.kind === "direct" ? (
      <span className={styles.status}>
        <i className={styles.onlineDot} />
        <span key={typing ? "typing" : "online"} className={styles.statusText}>
          {typing ? t("demo.typing") : t("demo.online")}
        </span>
      </span>
    ) : (
      <span className={styles.status}>
        {chat.kind === "group" ? t("demo.group") : t("demo.channel")}
      </span>
    );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim() === "") return;
    onSend(draft);
    setDraft("");
  };

  return (
    <section className={styles.conversation}>
      <header className={cn(styles.panel, styles.conversationHead)}>
        <button
          type="button"
          className={styles.back}
          aria-label={t("demo.back")}
          onClick={onBack}
        >
          <Icon name="arrowLeft" size="1.25rem" />
        </button>
        <Avatar name={t(chat.name)} tone={chat.tone} size="2.75rem" />
        <div className={styles.who}>
          <p className={styles.whoName}>{t(chat.name)}</p>
          {status}
        </div>
      </header>

      <div
        ref={scroller}
        className={styles.messages}
        role="log"
        aria-live="polite"
      >
        <div ref={list} className={styles.list}>
          {/* a fresh AnimatePresence per chat: switching chats must not play exit animations */}
          <AnimatePresence key={chat.id} initial={false}>
            {messages.map((message) => {
              const own = message.from === "me";
              const sender =
                chat.kind === "group" && !own && message.sender
                  ? t(PERSON_NAME[message.sender])
                  : undefined;
              return (
                <Slot key={message.id} own={own} fresh={message.fresh}>
                  <Bubble own={own} sender={sender} time={format(message.at)}>
                    {"key" in message.text
                      ? t(message.text.key)
                      : message.text.raw}
                  </Bubble>
                </Slot>
              );
            })}
            {typing && chat.kind !== "channel" && (
              <Slot key="typing" fresh hidden>
                <Bubble className={styles.typing}>
                  <i />
                  <i />
                  <i />
                </Bubble>
              </Slot>
            )}
          </AnimatePresence>
        </div>
      </div>

      {chat.kind === "channel" ? (
        <p className={cn(styles.panel, styles.readOnly)}>
          <Icon name="lock" size="1.125rem" />
          {t("demo.readOnly")}
        </p>
      ) : (
        <form className={cn(styles.panel, styles.composer)} onSubmit={submit}>
          <input
            className={styles.input}
            value={draft}
            maxLength={200}
            autoComplete="off"
            placeholder={t("demo.input")}
            aria-label={t("demo.input")}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            className={styles.send}
            type="submit"
            aria-label={t("demo.send")}
            disabled={draft.trim() === ""}
          >
            <Icon name="send" size="1.375rem" className={styles.sendIcon} />
          </button>
        </form>
      )}
    </section>
  );
});
