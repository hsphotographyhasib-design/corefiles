'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import {
  getMenuForRole, menuGroups, type MenuItem, type RoleKey,
} from '@/components/corefiles/data/menu'
import { cn } from '@/lib/utils'

/**
 * TabletNavDrawer — full-height overlay drawer for tablet/mobile breakpoints.
 * Triggered by the hamburger button in the FloatingHeader when viewport ≤ 1023px.
 *
 * Behaves like an Arc Browser / iOS-style side sheet:
 *  - Slides in from left with spring physics
 *  - Backdrop dims + blurs the content behind
 *  - Click outside or ESC closes
 *  - Selecting an item navigates + closes
 */
export function TabletNavDrawer() {
  const { user, view, setView, setBreadcrumbs, drawerOpen, setDrawerOpen, notifications } = useApp()
  const role = (user?.role || 'Employee') as RoleKey
  const items = React.useMemo(() => getMenuForRole(role), [role])
  const unread = notifications.filter(n => !n.read).length

  // ESC to close
  React.useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawerOpen, setDrawerOpen])

  const grouped = menuGroups
    .filter(g => items.some(i => i.group_id === g.id))
    .map(g => ({
      group: g,
      items: items.filter(i => i.group_id === g.id).sort((a, b) => a.sort_order - b.sort_order),
    }))

  const handleClick = (item: MenuItem) => {
    setView(item.url)
    setBreadcrumbs([{ label: item.name, view: item.url }])
    setDrawerOpen(false)
  }

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: -320, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="glass-nav fixed bottom-5 left-5 top-[108px] z-50 flex w-[280px] flex-col rounded-3xl p-3 lg:hidden"
            role="dialog"
            aria-label="Navigation drawer"
            aria-modal="true"
          >
            {/* Header row */}
            <div className="mb-2 flex items-center justify-between border-b border-border/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
                  <span className="text-xs font-bold">HJ</span>
                </div>
                <div>
                  <p className="text-xs font-semibold">Hasanur Jaya</p>
                  <p className="text-[10px] text-muted-foreground">{role}</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="cf-focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable nav */}
            <nav className="cf-scroll -mr-1 flex-1 space-y-4 overflow-y-auto pr-1">
              {grouped.map(({ group, items: groupItems }) => (
                <div key={group.id}>
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                    {group.name}
                  </p>
                  <ul className="space-y-0.5">
                    {groupItems.map(item => {
                      const active = view === item.url &&
                        item.id !== 'm-folders' && item.id !== 'm-shared' &&
                        item.id !== 'm-downloads' && item.id !== 'm-storage' &&
                        item.id !== 'm-backups' && item.id !== 'm-support'
                      const Icon = item.icon
                      const badge = item.badge_key === 'notifications' ? unread : undefined
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleClick(item)}
                            className={cn(
                              'cf-focus-ring group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all',
                              active
                                ? 'nav-active-pill text-primary'
                                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                            )}
                          >
                            {active && (
                              <span className="nav-active-bar absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" />
                            )}
                            <Icon size={18} strokeWidth={active ? 2.4 : 2} className="shrink-0" />
                            <span className="flex-1 truncate text-left">{item.name}</span>
                            {badge !== undefined && badge > 0 && (
                              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                                {badge}
                              </span>
                            )}
                            {!active && (
                              <ChevronRight size={14} className="text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Footer */}
            <div className="mt-2 border-t border-border/60 pt-2 text-center text-[10px] text-muted-foreground">
              CoreFiles v2.4.1 · Tap anywhere outside to close
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
