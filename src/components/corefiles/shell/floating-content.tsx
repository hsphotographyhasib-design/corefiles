'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/corefiles/store'
import { FloatingBreadcrumbs } from '@/components/corefiles/shell/floating-breadcrumbs'

/**
 * FloatingContent — the main content area as an independent floating card.
 *
 * Spec:
 *   - Position: below the dock (top: 108 + 64 + 20 = 192px on desktop, but the
 *     dock itself sits at 108px and is 64px tall, so content top = 192px)
 *   - Left/Right: 20px margins
 *   - Bottom: 20px
 *   - Rounded: 24px
 *   - Padding: 32px
 *   - Soft shadow, white/dark background
 *   - Own scroll (page background never moves)
 *
 * Layout:
 *   ┌─ Header (top: 20, h: 72) ────────────────────────┐
 *   │                                                   │
 *   ├─ Dock    (top: 108, h: 64) ───────────────────────┤  ← 16px gap from header
 *   │                                                   │
 *   ┌─ Content (top: 192, left/right/bottom: 20) ───────┐  ← 20px gap from dock
 *   │  Breadcrumbs                                      │
 *   │  [view content]                                   │
 *   └───────────────────────────────────────────────────┘
 */
export function FloatingContent({ children }: { children: React.ReactNode }) {
  const { view } = useApp()

  return (
    <main
      // Spec: top: 192px (108 + 64 + 20 gap), left/right: 20, bottom: 20
      className="fixed left-5 right-5 top-[192px] bottom-5 z-30 overflow-y-auto cf-scroll rounded-3xl"
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
