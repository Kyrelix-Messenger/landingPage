import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Reveal } from "@/shared/ui/reveal/Reveal";
import styles from "./Section.module.css";

interface SectionProps {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  /** Heading on the left, content on the right (the heading stays in view while the content scrolls). */
  split?: boolean;
  /** A compact block instead of the full page width. */
  narrow?: boolean;
  /** More content under the heading in a split section. */
  extra?: ReactNode;
}

/** A page section: anchor target, left-aligned heading, then its content. */
export function Section({
  id,
  title,
  lead,
  children,
  className,
  split,
  narrow,
  extra,
}: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      className={cn(
        styles.section,
        split && styles.split,
        narrow && styles.narrow,
        className,
      )}
      aria-labelledby={headingId}
    >
      <Reveal className={styles.head}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {lead && <p className={styles.lead}>{lead}</p>}
        {extra}
      </Reveal>
      {children}
    </section>
  );
}
