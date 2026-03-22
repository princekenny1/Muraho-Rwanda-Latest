/**
 * Responsive Layout Utilities
 * ============================
 * Shared layout primitives that handle responsive sizing across
 * mobile (320-480), tablet (481-768), desktop (769+).
 *
 * Usage:
 *   import { PageWrapper, ContentContainer, MediaContainer } from "@/components/layout/ResponsiveLayout";
 *   <PageWrapper> ... </PageWrapper>
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageWrapper — Full-width page container with safe-area padding.
 * Applies bottom padding for BottomNav on mobile, none on desktop.
 */
export function PageWrapper({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-background",
        "pb-20 md:pb-8", // BottomNav on mobile, normal on desktop
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ContentContainer — Centered content area with responsive max-width and padding.
 * Mobile: full-width with px-4
 * Tablet: max-w-2xl centered
 * Desktop: max-w-5xl centered
 */
export function ContentContainer({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        "px-4 sm:px-6 lg:px-8",
        "max-w-screen-sm sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * NarrowContainer — For text-heavy content (stories, testimonies, articles).
 * Keeps line lengths readable on large screens.
 */
export function NarrowContainer({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto",
        "px-4 sm:px-6",
        "max-w-screen-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MediaContainer — Responsive video/image container.
 * Maintains aspect ratio, caps width on large screens, centers content.
 */
export function MediaContainer({
  children,
  className,
  aspect = "video",
}: LayoutProps & { aspect?: "video" | "square" | "wide" | "portrait" }) {
  const aspectClass = {
    video: "aspect-video",       // 16:9
    square: "aspect-square",     // 1:1
    wide: "aspect-[21/9]",       // 21:9
    portrait: "aspect-[3/4]",    // 3:4
  }[aspect];

  return (
    <div
      className={cn(
        "w-full mx-auto overflow-hidden",
        "max-w-screen-sm sm:max-w-2xl md:max-w-4xl lg:max-w-5xl",
        "rounded-lg sm:rounded-xl md:rounded-2xl",
        aspectClass,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ResponsiveGrid — Adaptive grid that scales from 1 to N columns.
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
}: LayoutProps & {
  cols?: { default: number; sm?: number; md?: number; lg?: number; xl?: number };
}) {
  const colClasses = [
    cols.default === 1 ? "grid-cols-1" : cols.default === 2 ? "grid-cols-2" : "grid-cols-3",
    cols.sm ? `sm:grid-cols-${cols.sm}` : "",
    cols.md ? `md:grid-cols-${cols.md}` : "",
    cols.lg ? `lg:grid-cols-${cols.lg}` : "",
    cols.xl ? `xl:grid-cols-${cols.xl}` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("grid gap-4 sm:gap-5 lg:gap-6", colClasses, className)}>
      {children}
    </div>
  );
}

/**
 * HorizontalScroll — Horizontal scrollable container for card rows.
 * Adds proper snap-scrolling and edge fade on larger screens.
 */
export function HorizontalScroll({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        "flex gap-3 sm:gap-4 overflow-x-auto pb-2",
        "snap-x snap-mandatory scroll-smooth",
        "scrollbar-hide",
        "-mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * ScrollCard — Responsive card for horizontal scroll containers.
 * Scales from near-full-width on mobile to fixed-width on desktop.
 */
export function ScrollCard({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        "flex-shrink-0 snap-start",
        "w-[280px] sm:w-[320px] md:w-[340px]",
        className
      )}
    >
      {children}
    </div>
  );
}
