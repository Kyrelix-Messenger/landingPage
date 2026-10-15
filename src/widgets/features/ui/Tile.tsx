import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { GlowSurface } from "@/shared/ui/glow/GlowSurface";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import styles from "../Features.module.css";

interface TileProps {
  title: string;
  text: string;
  children?: ReactNode;
  /** Grid area class, e.g. styles.chats */
  area: string;
  /** Seconds, to stagger the tiles as they appear. */
  delay?: number;
  /** Text on the left, fragment on the right (a full-width tile). */
  wide?: boolean;
}

/** A feature tile: a short explanation on top, a fragment of the real interface below. */
export function Tile({ title, text, children, area, delay, wide }: TileProps) {
  return (
    <Reveal className={cn(styles.cell, area)} delay={delay}>
      <GlowSurface
        as="article"
        className={cn(styles.tile, wide && styles.tileWide)}
        glowClassName={styles.glow}
        data-fx="surface"
      >
        <header className={styles.tileHead}>
          <h3 className={styles.tileTitle}>{title}</h3>
          <p className={styles.tileText}>{text}</p>
        </header>
        {children && <div className={styles.visual}>{children}</div>}
      </GlowSurface>
    </Reveal>
  );
}
