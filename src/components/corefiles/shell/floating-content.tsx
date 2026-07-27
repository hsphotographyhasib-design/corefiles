'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/corefiles/store'
import { FloatingBreadcrumbs } from '@/components/corefiles/shell/floating-breadcrumbs'

/**
 * FloatingContent — the main content area as an independent floating card.
 *
 * Responsive top offset:
 *   - Mobile (≤767px): top = 76px (header 52 + top margin 16 + gap 8)
 *     Bottom = 96px (bottom nav 64 + bottom margin 16 + gap 16)
 *   - Tablet (768-1023px): top = 84px (header 56 + top margin 20 + gap 8)
 *     Bottom = 24px (no bottom nav on tablet; desktop dock is hidden)
 *   - Desktop (≥1024px): top = 152px (header 56 + 8 gap + dock 48 + 20 gap + 20 margin)
 *     Bottom = 20px
 *
 * Layout:
 *   Mobile:
 *   ┌─ Header (top: 16, h: 52) ────────────┐
 *   ├─ Content (top: 76, L/R: 16) ─────────┤
 *   ├─ Bottom Nav (bottom: 16, h: 64) ─────┤
 *
 *   Desktop:
 *   ┌─ Header (top: 20, h: 56, max-w: 1720) ─┐
 *   ├─ Dock    (top: 84, h: 48, max-w: 1500) ┤  ← 8px gap from header
 *   ├─ Content (top: 152, L/R: 20) ──────────┤  ← 20px gap from dock
 */
export function FloatingContent({ children }: { children: React.ReactNode }) {
  const { view } = useApp()

  return (
    <main
      // Mobile (≤767px): top 76 (header 52 + 16 margin + 8 gap), bottom 96 (bottom nav 64 + 16 margin + 16 gap)
      // Tablet (768-1023px): top 144 (header 56 + 20 margin + 8 gap + dock 48 + 12 gap), bottom 24
      // Desktop (≥1024px): top 152 (header 56 + 20 margin + 8 gap + dock 48 + 20 gap), bottom 20
      className="fixed left-4 right-4 top-[76px] bottom-[96px] z-30 overflow-y-auto cf-scroll rounded-3xl md:left-5 md:right-5 md:top-[144px] md:bottom-6 lg:top-[152px] lg:bottom-5"
      role="main"
    >
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-full rounded-3xl bg-card p-4 shadow-float sm:p-6 lg:p-8"
      >
        {/* Breadcrumbs at top of card */}
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
    </main>
  )
}
