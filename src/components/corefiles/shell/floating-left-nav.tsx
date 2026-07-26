'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp, type NavState } from '@/lib/corefiles/store'
import {
  getMenuForRole, menuGroups, type MenuItem, type RoleKey,
} from '@/components/corefiles/data/menu'
import { cn } from '@/lib/utils'

const widthMap: Record<NavState, number> = {
  expanded: 280,
  collapsed: 80,
  hidden: 0,
}

/** Tooltip shown when nav is collapsed (icons-only mode). */
function NavTooltip({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.12 }}
      className="cf-tooltip glass-nav pointer-events-none fixed z-50 flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium"
      role="tooltip"
      style={{ left: 96 }}
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
  const itemRef = React.useRef<HTMLButtonElement>(null)
  const [tooltipTop, setTooltipTop] = React.useState(0)

  // Position tooltip vertically aligned with the item
  React.useEffect(() => {
    if (hovered && collapsed && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      setTooltipTop(rect.top + rect.height / 2 - 14) // 14 = half tooltip height
    }
  }, [hovered, collapsed])

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        ref={itemRef}
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
          <div className="pointer-events-none fixed" style={{ top: tooltipTop }}>
            <NavTooltip label={item.name} shortcut={item.shortcut} />
          </div>
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

  // Hover-to-expand when collapsed (smart peek — doesn't persist)
  const [hoverPeek, setHoverPeek] = React.useState(false)
  const handleEnter = React.useCallback(() => {
    if (navState === 'collapsed') setHoverPeek(true)
  }, [navState])
  const handleLeave = React.useCallback(() => {
    setHoverPeek(false)
  }, [])

  // Effective state: hover peek expands the collapsed nav temporarily
  const effectiveState: NavState = hoverPeek && navState === 'collapsed' ? 'expanded' : navState
  const width = widthMap[effectiveState]
  const collapsed = effectiveState === 'collapsed'

  // Hidden state — render nothing (animation handles the slide-away)
  if (navState === 'hidden') return null

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
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      // Spec: Top 108px, Left 20px, Bottom 20px, Width 280px, Radius 24px
      // Hidden on tablet/mobile (lg breakpoint = 1024px)
      className="glass-nav fixed bottom-5 left-5 top-[108px] z-40 hidden w-[280px] rounded-3xl lg:block"
      role="navigation"
      aria-label="Primary"
    >
      <div
        className={cn(
          'flex h-full flex-col rounded-3xl p-3 transition-all',
          collapsed ? 'items-center' : 'items-stretch',
        )}
        style={{ width }}
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

        {/* Scrollable nav — independent of page scroll (because parent is fixed) */}
        <nav
          className="cf-scroll -mr-1 flex-1 space-y-4 overflow-y-auto pr-1"
          aria-label="Main navigation"
        >
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
                      active={view === item.url &&
                        item.id !== 'm-folders' && item.id !== 'm-shared' &&
                        item.id !== 'm-downloads' && item.id !== 'm-storage' &&
                        item.id !== 'm-backups' && item.id !== 'm-support'}
                      badge={item.badge_key === 'notifications' ? unread : undefined}
                      onClick={() => handleClick(item)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer: collapse hint */}
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
                  <kbd>⌘</kbd><kbd>\</kbd> to collapse
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
