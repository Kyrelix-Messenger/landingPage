import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import styles from "./Button.module.css";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "glass";
  size?: "md" | "lg";
  className?: string;
  /** Opens the link in a new tab (the web version lives on its own domain). */
  external?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  onClick,
}: ButtonProps) {
  const classes = cn(
    styles.button,
    styles[variant],
    size !== "md" && styles[size],
    className,
  );
  if (href) {
    return (
      <a
        className={classes}
        href={href}
        data-fx={variant === "primary" ? "primary" : undefined}
        {...(external ? { target: "_blank", rel: "noopener" } : null)}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      className={classes}
      type="button"
      data-fx={variant === "primary" ? "primary" : undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
