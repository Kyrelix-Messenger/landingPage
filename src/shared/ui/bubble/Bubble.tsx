import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./Bubble.module.css";

interface BubbleProps {
  children: ReactNode;
  own?: boolean;
  /** Author name, shown above incoming messages in groups. */
  sender?: string;
  time?: string;
  className?: string;
}

/** A message bubble with the messenger's shape: 20 px radius and a 6 px "tail" corner. */
export function Bubble({
  children,
  own,
  sender,
  time,
  className,
}: BubbleProps) {
  return (
    <div
      className={cn(styles.bubble, own ? styles.own : styles.other, className)}
    >
      {sender && <span className={styles.sender}>{sender}</span>}
      {children}
      {time && <time className={styles.time}>{time}</time>}
    </div>
  );
}
