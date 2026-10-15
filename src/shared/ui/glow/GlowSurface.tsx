import type { HTMLAttributes, PointerEvent } from "react";

interface GlowSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div";
  /** Class of the glow itself (size, gradient, fade). The surface has to clip and isolate it. */
  glowClassName: string;
}

/**
 * A surface with a glow under the cursor. The glow is a real element with a static gradient that
 * this component moves by writing `transform` straight to it: no custom properties, so nothing
 * but that one element is restyled, and the compositor does the rest. It follows the cursor
 * instantly; only the fade in and out (the surface's :hover rule) takes 0.1 s.
 */
export function GlowSurface({
  as: Tag = "div",
  glowClassName,
  children,
  ...rest
}: GlowSurfaceProps) {
  const follow = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const surface = event.currentTarget;
    const glow = surface.firstElementChild as HTMLElement | null;
    if (!glow) return;
    const rect = surface.getBoundingClientRect();
    glow.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0) translate(-50%, -50%)`;
  };

  return (
    <Tag {...rest} onPointerMove={follow} onPointerEnter={follow}>
      <span className={glowClassName} aria-hidden="true" />
      {children}
    </Tag>
  );
}
