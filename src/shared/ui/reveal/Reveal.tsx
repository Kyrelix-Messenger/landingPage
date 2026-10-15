import type { ReactNode } from "react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds, to stagger siblings. */
  delay?: number;
}

/**
 * Fades its content in (and lifts it a little) when it scrolls into view, once. Short on purpose:
 * a slow fade makes glass surfaces look unfinished (a hover glow cannot show before the fade ends).
 * Under "reduced motion" <MotionConfig> drops the lift and keeps the fade.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
