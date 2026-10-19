import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import type { Theme } from "@/shared/boot/boot";
import { useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { useThemeStore } from "@/shared/theme";
import { Icon } from "@/shared/ui/icon/Icon";
import { CHATS, chatById } from "./model/demoData";
import { useDemoChat } from "./model/useDemoChat";
import { Conversation } from "./ui/Conversation";
import { Rail } from "./ui/Rail";
import { Sidebar } from "./ui/Sidebar";
import styles from "./AppPreview.module.css";

interface AppPreviewProps {
  /**
   * The hero instance plays an opening conversation and accepts input.
   * The static instance (theme comparison) shows the finished conversation and does nothing.
   */
  interactive?: boolean;
  className?: string;
}

/**
 * A live miniature of the messenger on a static gradient. Decorative layers stay still;
 * only the chat itself and its controls are interactive.
 */
export function AppPreview({ interactive = true, className }: AppPreviewProps) {
  const { t } = useTranslation();

  // The theme button inside the window changes the theme of the window only. The page theme still
  // wins whenever it changes: the override is valid only for the page theme it was made under.
  const siteTheme = useThemeStore((state) => state.theme);
  const [override, setOverride] = useState<{
    theme: Theme;
    site: Theme;
  } | null>(null);
  const theme = override?.site === siteTheme ? override.theme : siteTheme;
  const stageRef = useRef<HTMLDivElement>(null);
  const toggleTheme = useCallback(() => {
    const stage = stageRef.current;
    stage?.setAttribute("data-theming", "");
    window.setTimeout(() => stage?.removeAttribute("data-theming"), 500);
    setOverride({
      theme: theme === "dark" ? "light" : "dark",
      site: siteTheme,
    });
  }, [theme, siteTheme]);
  const demo = useDemoChat(interactive);

  // Swapping the rail side slides the two columns past each other (FLIP). It measures offsetLeft,
  // so the panel animation stays independent of scrolling and container sizing.
  const reducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const flipFrom = useRef<{ content: number; rail: number } | null>(null);

  const { swapSide: swapDemoSide, setPane } = demo;
  const swapSide = useCallback(() => {
    if (contentRef.current && railRef.current) {
      flipFrom.current = {
        content: contentRef.current.offsetLeft,
        rail: railRef.current.offsetLeft,
      };
    }
    swapDemoSide();
  }, [swapDemoSide]);
  const showList = useCallback(() => setPane("list"), [setPane]);

  useLayoutEffect(() => {
    const from = flipFrom.current;
    flipFrom.current = null;
    const content = contentRef.current;
    const rail = railRef.current;
    if (!from || !content || !rail || reducedMotion) return;
    const slide = (element: HTMLElement, dx: number) => {
      if (dx === 0) return;
      element.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: "none" }],
        {
          duration: 420,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    };
    slide(content, from.content - content.offsetLeft);
    slide(rail, from.rail - rail.offsetLeft);
  }, [demo.side, reducedMotion]);

  const { state, section, activeId, pane } = demo;
  const chat = chatById(activeId);
  const list = useMemo(
    () =>
      CHATS.filter(
        (item) => item.section === (section === "calls" ? "chats" : section),
      ),
    [section],
  );
  const unreadGroups = CHATS.filter((item) => item.section === "groups").reduce(
    (sum, item) => sum + state.unread[item.id],
    0,
  );

  const content =
    section === "calls" ? (
      <section className={cn(styles.panel, styles.callsPage)}>
        <Icon
          name="calls"
          size="4rem"
          strokeWidth={1.25}
          className={styles.callsIcon}
        />
        <p className={styles.callsTitle}>{t("demo.calls")}</p>
        <p className={styles.callsText}>{t("demo.callsText")}</p>
      </section>
    ) : (
      <>
        <Sidebar
          title={section === "groups" ? "demo.groups" : "demo.chats"}
          chats={list}
          activeId={activeId}
          messages={state.messages}
          unread={state.unread}
          typing={state.typing}
          query={demo.query}
          onQuery={demo.setQuery}
          onOpen={demo.openChat}
        />
        <Conversation
          chat={chat}
          messages={state.messages[activeId]}
          typing={state.typing === activeId}
          onSend={demo.send}
          onBack={showList}
          followMessages={interactive}
        />
      </>
    );

  return (
    <div
      ref={stageRef}
      className={cn(styles.stage, className)}
      data-theme={
        interactive && override?.site === siteTheme ? theme : undefined
      }
    >
      {interactive && (
        <>
          <div className={cn(styles.glow, styles.glowA)} aria-hidden="true" />
          <div className={cn(styles.glow, styles.glowB)} aria-hidden="true" />
        </>
      )}

      <m.div
        className={styles.frame}
        initial={interactive ? { opacity: 0, scale: 0.97 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div
          className={styles.window}
          role="group"
          aria-label={t("a11y.demo")}
          data-pane={pane}
          data-side={demo.side}
          style={
            interactive
              ? { boxShadow: "0 44px 5rem -1.25rem var(--window-shadow)" }
              : undefined
          }
        >
          <div
            className={cn(styles.sphere, styles.sphereA)}
            aria-hidden="true"
          />
          <div
            className={cn(styles.sphere, styles.sphereB)}
            aria-hidden="true"
          />

          <div className={styles.layout}>
            <div ref={contentRef} className={styles.content}>
              {content}
            </div>
            <div ref={railRef} className={styles.railSlot}>
              <Rail
                section={section}
                unreadGroups={unreadGroups}
                onSection={demo.openSection}
                onSwapSide={swapSide}
                onToggleTheme={toggleTheme}
              />
            </div>
          </div>
        </div>
      </m.div>
    </div>
  );
}
