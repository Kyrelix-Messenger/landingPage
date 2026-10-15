import type { CSSProperties, ReactNode } from "react";

interface IconDefinition {
  viewBox: string;
  /** Glyphs drawn as a filled shape (the client's "groups", "new group" and "send"). */
  filled?: boolean;
  strokeWidth?: number;
  glyph: ReactNode;
}

/** Glyphs match frontend/src/shared/ui/icons/picturesSVG.tsx; the rest follow the same Feather-like style. */
const ICONS = {
  chat: {
    viewBox: "0 0 24 24",
    glyph: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  profile: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
  calls: {
    viewBox: "0 0 24 24",
    glyph: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  settings: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
  groups: {
    viewBox: "0 0 2048 2048",
    filled: true,
    strokeWidth: 26,
    glyph: (
      <path d="M1850 688q45 25 82 61t62 80t40 93t14 102h-128q0-52-20-99t-55-81t-82-55t-99-21q-53 0-99 20t-81 55t-55 82t-21 99q0 91-41 173t-115 136q65 33 117 81t90 108t57 128t20 142h-128q0-79-30-149t-83-122t-122-82t-149-31q-79 0-149 30t-122 83t-82 122t-31 149H512q0-73 20-141t57-128t89-108t118-82q-73-54-114-136t-42-173q0-52-20-99t-55-81t-82-55t-99-21q-53 0-99 20t-81 55t-55 82t-21 99H0q0-52 14-101t39-93t63-80t82-62q-33-35-51-81t-19-95q0-52 20-99t55-81t81-55t100-21q52 0 99 20t81 55t55 82t21 99q0 49-18 95t-52 81q82 45 134 124q54-80 138-126t182-46q97 0 181 46t139 126q52-79 134-124q-33-35-51-81t-19-95q0-52 20-99t55-81t81-55t100-21q52 0 99 20t81 55t55 82t21 99q0 49-18 95t-52 81M256 512q0 27 10 50t27 40t41 28t50 10q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10q-27 0-50 10t-40 27t-28 41t-10 50m768 768q52 0 99-20t81-55t55-81t21-100q0-52-20-99t-55-81t-82-55t-99-21q-53 0-99 20t-81 55t-55 82t-21 99q0 53 20 99t55 81t81 55t100 21m512-768q0 27 10 50t27 40t41 28t50 10q27 0 50-10t40-27t28-41t10-50q0-27-10-50t-27-40t-41-28t-50-10q-27 0-50 10t-40 27t-28 41t-10 50" />
    ),
  },
  newGroup: {
    viewBox: "0 0 1024 1024",
    filled: true,
    strokeWidth: 14,
    glyph: (
      <path d="M892 772h-80v-80c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v80h-80c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h80v80c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-80h80c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8M373.5 498.4c-.9-8.7-1.4-17.5-1.4-26.4c0-15.9 1.5-31.4 4.3-46.5c.7-3.6-1.2-7.3-4.5-8.8c-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6c24.7-25.3 57.9-39.1 93.2-38.7c31.9.3 62.7 12.6 86 34.4c7.9 7.4 14.7 15.6 20.4 24.4c2 3.1 5.9 4.4 9.3 3.2c17.6-6.1 36.2-10.4 55.3-12.4c5.6-.6 8.8-6.6 6.3-11.6c-32.5-64.3-98.9-108.7-175.7-109.9c-110.8-1.7-203.2 89.2-203.2 200c0 62.8 28.9 118.8 74.2 155.5c-31.8 14.7-61.1 35-86.5 60.4c-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5c29.4-29.4 65.4-49.8 104.7-59.7c3.8-1.1 6.4-4.8 5.9-8.8M824 472c0-109.4-87.9-198.3-196.9-200C516.3 270.3 424 361.2 424 472c0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C357 742.6 326 814.8 324 891.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7c1.9-58 25.4-112.3 66.7-153.5C505.8 695.7 563 672 624 672c110.4 0 200-89.5 200-200m-109.5 90.5C690.3 586.7 658.2 600 624 600s-66.3-13.3-90.5-37.5a127.26 127.26 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88c24-24.6 56.1-38.3 90.4-38.7c33.9-.3 66.8 12.9 91 36.6c24.8 24.3 38.4 56.8 38.4 91.4c-.1 34.2-13.4 66.3-37.6 90.5" />
    ),
  },
  globe: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
  },
  moon: {
    viewBox: "0 0 24 24",
    glyph: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  },
  sun: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </>
    ),
  },
  search: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    ),
  },
  send: {
    viewBox: "0 0 24 24",
    filled: true,
    strokeWidth: 0,
    glyph: <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />,
  },
  check: { viewBox: "0 0 24 24", glyph: <polyline points="20 6 9 17 4 12" /> },
  chevronDown: {
    viewBox: "0 0 24 24",
    glyph: <polyline points="6 9 12 15 18 9" />,
  },
  arrowRight: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    ),
  },
  arrowLeft: {
    viewBox: "0 0 24 24",
    glyph: <path d="M19 12H5M12 19l-7-7 7-7" />,
  },
  arrowUpRight: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </>
    ),
  },
  menu: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <line x1="3" y1="7" x2="21" y2="7" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="17" x2="21" y2="17" />
      </>
    ),
  },
  close: { viewBox: "0 0 24 24", glyph: <path d="M18 6L6 18M6 6l12 12" /> },
  lock: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
  mail: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
  },
  key: {
    viewBox: "0 0 24 24",
    glyph: (
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    ),
  },
  reset: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </>
    ),
  },
  shield: {
    viewBox: "0 0 24 24",
    glyph: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  swapSide: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </>
    ),
  },
  phone: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </>
    ),
  },
  compare: {
    viewBox: "0 0 24 24",
    glyph: <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />,
  },
  info: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </>
    ),
  },
  business: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
  },
  at: {
    viewBox: "0 0 24 24",
    glyph: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
      </>
    ),
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  className?: string;
  /** Any CSS length. Defaults to 1.25em so icons scale with the surrounding text. */
  size?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export function Icon({
  name,
  className,
  size = "1.25em",
  strokeWidth,
  style,
}: IconProps) {
  const icon: IconDefinition = ICONS[name];
  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill={icon.filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth ?? icon.strokeWidth ?? 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none", ...style }}
    >
      {icon.glyph}
    </svg>
  );
}
