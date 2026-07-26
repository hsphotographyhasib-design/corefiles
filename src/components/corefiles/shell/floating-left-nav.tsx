'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, type NavState } from '@/lib/corefiles/store'
import {
  getMenuForRole, menuGroups, type MenuItem, type RoleKey,
} from '@/components/corefiles/data/menu'
import { useApp as useAppStore } from '@/lib/corefiles/store'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

const widthMap: Record<NavState, number> = {
  expanded: 280,
  collapsed: 80,
  hidden: 0,
}

/** Hook: tracks mouse activity inside the nav and auto-collapses after 2s idle. */
function useAutoCollapse(navState: NavState) {
  const { collapseNav, expandNav, navUserOverride } = useAppStore()
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const hovering = React.useRef(false)

  const onEnter = React.useCallback(() => {
    hovering.current = true
    if (timer.current) clearTimeout(timer.current)
    // If user hasn't explicitly set state, expand on hover
    if (!navUserOverride && navState !== 'expanded') expandNav()
  }, [navState, navUserOverride, expandNav])

  const onLeave = React.useCallback(() => {
    hovering.current = false
    if (timer.current) clearTimeout(timer.current)
    if (!navUserOverride) {
      timer.current = setTimeout(() => {
        if (!hovering.current) collapseNav()
      }, 2000)
    }
  }, [navUserOverride, collapseNav])

  React.useEffect(() => {
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [])

  return { onEnter, onLeave }
}

/** Tooltip shown when nav is collapsed */
function NavTooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.12 }}
      className="cf-tooltip glass-nav pointer-events-none fixed left-[88px] z-50 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium"
      role="tooltip"
    >
      {label}
      {shortcut && (
        <span className="ml-1 flex items-center gap-0.5 text-[9px] text-muted-foreground">
          {shortcut.split(' ').map((k, i) => (
            <kbd key={i} className="rounded border border-border bg-muted/60 px-1 py-0.5">{k}</kbd>
          ))}
        </span>
      )}
    </motion.div>
  )
}

function NavItem({
  item, collapsed, active, badge, onClick,
}: {
  item: MenuItem
  collapsed: boolean
  active: boolean
  badge?: number
  onClick: () => void
}) {
  const [hovered, setHovered] = React.useState(false)
  const Icon = item.icon

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        aria-label={item.name}
        title={collapsed ? item.name : undefined}
        className={cn(
          'cf-focus-ring group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all',
          active ? 'nav-active-pill text-primary' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <motion.span
            layoutId="nav-active-bar"
            className="nav-active-bar absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full"
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <Icon
          size={18}
          strokeWidth={active ? 2.4 : 2}
          className="shrink-0 transition-transform group-hover:scale-110"
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="flex-1 truncate text-left"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && badge !== undefined && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white ring-2 ring-background"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
        {!collapsed && item.shortcut && !badge && (
          <span className="hidden items-center gap-0.5 text-[9px] text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100 lg:flex">
            {item.shortcut.split(' ').map((k, i) => (
              <kbd key={i} className="rounded border border-border bg-muted/60 px-1 py-0.5">{k}</kbd>
            ))}
          </span>
        )}
      </button>

      {/* Tooltip when collapsed */}
      <AnimatePresence>
        {collapsed && hovered && (
          <NavTooltip label={item.name} shortcut={item.shortcut} />
        )}
      </AnimatePresence>

      {/* Mobile-style dot indicator for active when collapsed */}
      {collapsed && active && (
        <span className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
    </div>
  )
}

export function FloatingLeftNav() {
  const { user, view, setView, setBreadcrumbs, navState, notifications } = useApp()
  const role = (user?.role || 'Employee') as RoleKey
  const items = React.useMemo(() => getMenuForRole(role), [role])
  const unread = notifications.filter(n => !n.read).length
  const { onEnter, onLeave } = useAutoCollapse(navState)

  // Hidden state — render nothing (animation handles the collapse)
  if (navState === 'hidden') return null

  const width = widthMap[navState]
  const collapsed = navState === 'collapsed'

  // Group items by group_id, preserving sort order
  const grouped = menuGroups
    .filter(g => items.some(i => i.group_id === g.id))
    .map(g => ({
      group: g,
      items: items
        .filter(i => i.group_id === g.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    }))

  const handleClick = (item: MenuItem) => {
    setView(item.url)
    setBreadcrumbs([{ label: item.name, view: item.url }])
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="sticky top-[100px] z-30 hidden h-[calc(100vh-124px)] md:block"
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          'glass-nav flex h-full flex-col rounded-3xl p-3 transition-all',
          collapsed ? 'items-center' : 'items-stretch',
        )}
      >
        {/* Workspace mini badge at top (only when expanded) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex items-center gap-2 rounded-2xl bg-accent/40 px-3 py-2"
            >
              <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                HJ
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold">Hasanur Jaya</p>
                <p className="text-[9px] text-muted-foreground">{role}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable nav */}
        <nav className="cf-scroll -mr-1 flex-1 space-y-4 overflow-y-auto pr-1" aria-label="Main">
          {grouped.map(({ group, items: groupItems }) => (
            <div key={group.id}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70"
                  >
                    {group.name}
                  </motion.p>
                )}
              </AnimatePresence>
              <ul className="space-y-0.5">
                {groupItems.map(item => (
                  <li key={item.id}>
                    <NavItem
                      item={item}
                      collapsed={collapsed}
                      active={view === item.url && item.id !== 'm-folders' && item.id !== 'm-shared' && item.id !== 'm-downloads' && item.id !== 'm-storage' && item.id !== 'm-backups' && item.id !== 'm-support'}
                      badge={item.badge_key === 'notifications' ? unread : undefined}
                      onClick={() => handleClick(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: collapse toggle hint + quick stats */}
        <div className="mt-2 border-t border-border/60 pt-2">
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed ? (
              <motion.div
                key="expanded-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground"
              >
                <span>v2.4.1</span>
                <span className="flex items-center gap-1">
                  <kbd>⌘</kbd><kbd>\\</kbd> to collapse
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-muted/40 text-[9px] font-bold text-muted-foreground">
                  v2
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

// Keyboard shortcut: ⌘\ toggles nav
if (typeof window !== 'undefined') {
  let bound = false
  if (!bound) {
    bound = true
    // Defer binding to allow Zustand hydration
    setTimeout(() => {
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
          e.preventDefault()
          useAppStore.getState().toggleNav()
        }
      })
    }, 100)
  }
}
