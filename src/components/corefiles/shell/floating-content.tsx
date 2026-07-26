'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, type NavState } from '@/lib/corefiles/store'
import { FloatingBreadcrumbs } from '@/components/corefiles/shell/floating-breadcrumbs'
import { cn } from '@/lib/utils'

/**
 * FloatingContent — the main content area as an independent floating card.
 *
 * Spec:
 *   - Desktop: fixed top-[108px], left=[nav_width + 40px], right-5, bottom-5,
 *              rounded-3xl, padding 32px, soft shadow, own scroll.
 *   - Tablet:  same, but left-5 (nav is an overlay drawer).
 *   - Mobile:  fixed top-[88px], left-3, right-3, bottom-[88px] (leaves room for bottom nav).
 *
 * The card's `left` offset shifts smoothly when the nav state changes between
 * expanded (280px), collapsed (80px), and hidden (0px).
 */
export function FloatingContent({ children }: { children: React.ReactNode }) {
  const { view, navState } = useApp()

  // Compute left offset based on nav state.
  // 20px (page margin) + nav_width + 20px (gap) = 40 + nav_width
  const navWidth: Record<NavState, number> = { expanded: 280, collapsed: 80, hidden: 0 }
  const desktopLeft = navWidth[navState] + 40

  return (
    <main
      // Spec: Top 108px, Left 320px (expanded), Right 20px, Bottom 20px
      // Padding 32px, Radius 24px, soft shadow, white/dark bg, own scroll
      className={cn(
        'fixed z-30 overflow-y-auto cf-scroll',
        // Default = mobile (left-3 right-3 top-[88px] bottom-[88px])
        'left-3 right-3 top-[88px] bottom-[88px]',
        // Tablet (md: 768-1023) — nav becomes overlay drawer, content takes full width
        'md:left-5 md:right-5 md:top-[108px] md:bottom-5',
        // Desktop (lg: 1024+) — content floats next to the nav with proper offset
      )}
      style={{
        // The dynamic desktop offset — only applied at lg+ via a media query
        // We use a CSS variable that's overridden at the lg breakpoint
        ['--nav-offset' as string]: `${desktopLeft}px`,
      }}
    >
      {/* Inner card with rounded corners + padding + shadow */}
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'min-h-full rounded-3xl bg-card p-4 shadow-float sm:p-6 lg:p-8',
          // lg:card uses lg:max-w-[none] — fills the available space
        )}
        // Apply the desktop left offset via inline style at lg+
        data-nav-offset={desktopLeft}
      >
        {/* Breadcrumb sits at the top of the floating content card */}
        <div className="mb-4">
          <FloatingBreadcrumbs />
        </div>

        {/* View content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Style override: at lg+, the main element uses the dynamic nav offset */}
      <style jsx>{`
        @media (min-width: 1024px) {
          main {
            left: var(--nav-offset) !important;
            transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
      `}</style>
    </main>
  )
}
