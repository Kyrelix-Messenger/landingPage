import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  m,
  useMotionTemplate,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { Theme } from "@/shared/boot/boot";
import { useTranslation } from "@/shared/i18n";
import { cn } from "@/shared/lib/cn";
import { usePointerSpring } from "@/shared/lib/pointer";
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
   * The hero instance reacts to the cursor, plays an opening conversation and accepts input.
   * The static instance (theme comparison) shows the finished conversation and does nothing.
   */
  interactive?: boolean;
  className?: string;
}

/**
 * A live miniature of the messenger: chat list, conversation and navigation rail, on the
 * messenger's own gradient. The cursor tilts the window and moves the spheres behind the glass
 * panels, so the glass visibly picks up the colour of whatever passes under it.
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
  const { x, y } = usePointerSpring(interactive);

  // window: turns towards the cursor; spheres move against it at different depths
  const rotateY = useTransform(x, [-0.5, 0.5], [-5.5, 5.5]);
  const rotateX = useTransform(y, [-0.5, 0.5], [4.5, -4.5]);
  const innerAx = useTransform(x, (v) => v * -150);
  const innerAy = useTransform(y, (v) => v * -120);
  const innerBx = useTransform(x, (v) => v * 210);
  const innerBy = useTransform(y, (v) => v * 160);
  const outerAx = useTransform(x, (v) => v * -260);
  const outerAy = useTransform(y, (v) => v * -200);
  const outerBx = useTransform(x, (v) => v * 320);
  const outerBy = useTransform(y, (v) => v * 240);
  const glareX = useTransform(x, (v) => 50 + v * 150);
  const glareY = useTransform(y, (v) => 40 + v * 150);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, var(--glare), transparent 52%)`;
  const shadowX = useTransform(x, (v) => v * -70);
  const shadowY = useTransform(y, (v) => 44 + v * -36);
  const boxShadow = useMotionTemplate`${shadowX}px ${shadowY}px 5rem -1.25rem var(--window-shadow)`;

  // Swapping the rail side slides the two columns past each other (FLIP). It measures offsetLeft,
  // which ignores the 3D tilt of the ancestors; framer-motion's layout projection does not.
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
          <m.div
            className={cn(styles.glow, styles.glowA)}
            style={{ x: outerAx, y: outerAy }}
            aria-hidden="true"
          />
          <m.div
            className={cn(styles.glow, styles.glowB)}
            style={{ x: outerBx, y: outerBy }}
            aria-hidden="true"
          />
        </>
      )}

      <m.div
        className={styles.tilt}
        style={
          interactive
            ? { rotateX, rotateY, transformPerspective: 1800 }
            : undefined
        }
        initial={interactive ? { opacity: 0, scale: 0.97 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <m.div
          className={styles.window}
          role="group"
          aria-label={t("a11y.demo")}
          data-pane={pane}
          data-fx={interactive ? "surface" : undefined}
          data-side={demo.side}
          style={interactive ? { boxShadow } : undefined}
        >
          <m.div
            className={cn(styles.sphere, styles.sphereA)}
            style={interactive ? { x: innerAx, y: innerAy } : undefined}
            aria-hidden="true"
          />
          <m.div
            className={cn(styles.sphere, styles.sphereB)}
            style={interactive ? { x: innerBx, y: innerBy } : undefined}
            aria-hidden="true"
          />
          {interactive && (
            <m.div
              className={styles.glare}
              style={{ background: glare }}
              aria-hidden="true"
            />
          )}

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
        </m.div>
      </m.div>
    </div>
  );
}
