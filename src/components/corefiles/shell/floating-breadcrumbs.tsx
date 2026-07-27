/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { cn } from '@/lib/utils'

/**
 * FloatingBreadcrumbs — inline breadcrumb row rendered inside the FloatingContent
 * card. Items are clickable for backward navigation; clicking a parent truncates
 * the trail to that position.
 */
export function FloatingBreadcrumbs() {
  const { breadcrumbs, setView, setCurrentFolder, setBreadcrumbs } = useApp()

  const handleClick = (crumb: { label: string; view?: any; folderId?: string }, idx: number) => {
    if (!crumb.view && !crumb.folderId) return
    if (crumb.view) setView(crumb.view)
    if (crumb.folderId) setCurrentFolder(crumb.folderId)
    setBreadcrumbs(breadcrumbs.slice(0, idx + 1))
  }

  if (breadcrumbs.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Breadcrumb"
      className="flex items-center gap-1 overflow-x-auto no-scrollbar text-sm"
    >
      <button
        onClick={() => { setView('dashboard'); setBreadcrumbs([{ label: 'Dashboard', view: 'dashboard' }]) }}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Home"
      >
        <Home size={14} />
      </button>
      <AnimatePresence mode="popLayout">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1
          const clickable = !isLast && (crumb.view || crumb.folderId)
          return (
            <React.Fragment key={i}>
              <motion.div
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex shrink-0 items-center gap-1"
              >
                <ChevronRight size={13} className="text-muted-foreground/40" />
                <button
                  onClick={() => clickable && handleClick(crumb, i)}
                  disabled={!clickable}
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs transition-colors',
                    isLast
                      ? 'font-semibold text-foreground'
                      : clickable
                        ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        : 'text-muted-foreground',
                  )}
                >
                  {crumb.label}
                </button>
              </motion.div>
            </React.Fragment>
          )
        })}
      </AnimatePresence>
    </motion.nav>
  )
}
