import type { CSSProperties } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./Avatar.module.css";

interface AvatarProps {
  name: string;
  /** Any CSS length; defaults to 2.75rem. */
  size?: string;
  /** Alternative gradients so a list of avatars is not a row of clones. */
  tone?: 0 | 1 | 2;
  className?: string;
}

/** Letter avatar, derived from the name the way the messenger derives it. */
export function Avatar({ name, size, tone = 0, className }: AvatarProps) {
  const letter = Array.from(name.trim())[0]?.toUpperCase() ?? "?";
  const style = size ? ({ "--avatar-size": size } as CSSProperties) : undefined;
  return (
    <span
      className={cn(
        styles.avatar,
        tone > 0 && styles[`tone${tone}`],
        className,
      )}
      style={style}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
