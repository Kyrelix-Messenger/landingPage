import type { ReactNode } from "react";
import { m } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds, to stagger siblings. */
  delay?: number;
}

/**
 * Lifts its content a little when it scrolls into view, once. It deliberately does not fade: an
 * element with opacity below 1 is a backdrop root, so the glass inside cannot see the page behind it
 * and looks grey until the animation ends, then jumps to its real colour. Under "reduced motion"
 * <MotionConfig> drops the lift and the content is simply there.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <m.div
      className={className}
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </m.div>
  );
}
