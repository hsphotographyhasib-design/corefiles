'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Plus, Menu as MenuIcon,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { getDockMenuForRole, type MenuItem, type RoleKey } from '@/components/corefiles/data/menu'
import { cn } from '@/lib/utils'

/**
 * FloatingDockNav — premium horizontal floating dock navigation.
 *
 * Spec:
 *   - Position: below the header (top: 108px), full width with 20px L/R margins
 *   - Width: auto, max 1400px, centered
 *   - Height: 64px
 *   - Border radius: 999px (pill)
 *   - Padding: 12px
 *   - Glass background, blur, soft shadow
 *   - Horizontally scrollable with momentum + snap
 *   - Drag to scroll, mouse wheel → horizontal scroll, touch swipe
 *   - Left/right arrow buttons appear when overflow
 *   - Active item: green pill + spring-animated indicator
 *   - Hover: scale + glow + lift
 *   - Keyboard: ← → navigate between items
 *   - Active item auto-scrolls into view
 *   - Never wraps, never creates two rows
 */
export function FloatingDockNav() {
  const { user, view, setView, setBreadcrumbs, notifications } = useApp()
  const role = (user?.role || 'Employee') as RoleKey
  const items = React.useMemo(() => getDockMenuForRole(role), [role])
  const unread = notifications.filter(n => !n.read).length

  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<Map<string, HTMLButtonElement | null>>(new Map())
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragStart = React.useRef<{ x: number; scrollLeft: number } | null>(null)

  // ------------------------- Scroll state -------------------------

  const updateScrollState = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  React.useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [updateScrollState, items.length])

  // ------------------------- Auto-scroll active into view -------------------------

  React.useEffect(() => {
    const activeBtn = itemRefs.current.get(view)
    const scroller = scrollerRef.current
    if (!activeBtn || !scroller) return
    const btnRect = activeBtn.getBoundingClientRect()
    const scrollerRect = scroller.getBoundingClientRect()
    // Only scroll if the active item is not fully visible
    if (btnRect.left < scrollerRect.left + 40 || btnRect.right > scrollerRect.right - 40) {
      const offset = activeBtn.offsetLeft - scroller.clientWidth / 2 + activeBtn.clientWidth / 2
      scroller.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [view, items])

  // ------------------------- Wheel → horizontal scroll -------------------------

  const onWheel = React.useCallback((e: React.WheelEvent) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    // If there's horizontal scroll room, convert vertical wheel to horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      if (scroller.scrollWidth > scroller.clientWidth) {
        e.preventDefault()
        scroller.scrollLeft += e.deltaY
      }
    }
  }, [])

  // ------------------------- Drag-to-scroll -------------------------

  const onPointerDown = React.useCallback((e: React.PointerEvent) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    // Don't initiate drag if user clicked a button
    if ((e.target as HTMLElement).closest('button[data-dock-item]')) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, scrollLeft: scroller.scrollLeft }
    scroller.setPointerCapture(e.pointerId)
    scroller.style.cursor = 'grabbing'
    scroller.style.userSelect = 'none'
  }, [])

  const onPointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current || !scrollerRef.current) return
    const dx = e.clientX - dragStart.current.x
    scrollerRef.current.scrollLeft = dragStart.current.scrollLeft - dx
  }, [isDragging])

  const onPointerUp = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    dragStart.current = null
    if (scrollerRef.current) {
      scrollerRef.current.releasePointerCapture(e.pointerId)
      scrollerRef.current.style.cursor = ''
      scrollerRef.current.style.userSelect = ''
    }
  }, [isDragging])

  // ------------------------- Arrow buttons -------------------------

  const scrollByAmount = React.useCallback((dir: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const amount = Math.min(scroller.clientWidth * 0.7, 320)
    scroller.scrollBy({ left: amount * dir, behavior: 'smooth' })
  }, [])

  // ------------------------- Keyboard ← → -------------------------

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      // Ignore if modifier other than none
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return

      const idx = items.findIndex(i => i.url === view)
      if (idx === -1) return
      const nextIdx = e.key === 'ArrowLeft'
        ? Math.max(0, idx - 1)
        : Math.min(items.length - 1, idx + 1)
      if (nextIdx === idx) return
      e.preventDefault()
      const next = items[nextIdx]
      setView(next.url)
      setBreadcrumbs([{ label: next.name, view: next.url }])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [items, view, setView, setBreadcrumbs])

  // ------------------------- Render -------------------------

  const handleClick = (item: MenuItem) => {
    setView(item.url)
    setBreadcrumbs([{ label: item.name, view: item.url }])
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.05 }}
      // Spec: top: 108px (header 72 + 16 gap + 20 margin), centered, max 1400px, h-64, rounded-full, p-12px
      className="fixed left-1/2 top-[108px] z-40 flex h-16 w-[calc(100vw-2.5rem)] max-w-[1400px] -translate-x-1/2 items-center gap-1.5 rounded-full p-3 glass-nav"
      role="navigation"
      aria-label="Primary"
    >
      {/* Left arrow */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => scrollByAmount(-1)}
            className="cf-focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Scroll menu left"
          >
            <ChevronLeft size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scrollable dock */}
      <div
        ref={scrollerRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onScroll={updateScrollState}
        className="cf-scroll no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x proximity',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'pan-x',
        }}
      >
        {items.map(item => {
          const active = view === item.url &&
            item.id !== 'm-folders' && item.id !== 'm-shared' &&
            item.id !== 'm-downloads'
          const Icon = item.icon
          const badge = item.badge_key === 'notifications' ? unread : undefined
          return (
            <button
              key={item.id}
              ref={(el) => { itemRefs.current.set(item.url, el) }}
              data-dock-item="true"
              onClick={() => handleClick(item)}
              aria-current={active ? 'page' : undefined}
              aria-label={item.name}
              className={cn(
                'cf-focus-ring group relative flex h-11 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm font-medium transition-colors sm:px-4',
                active
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ scrollSnapAlign: 'center' }}
            >
              {/* Active indicator — spring-animated */}
              {active && (
                <motion.span
                  layoutId="dock-active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}

              {/* Hover wash */}
              {!active && (
                <span className="absolute inset-0 rounded-full bg-accent/0 transition-colors group-hover:bg-accent/60" />
              )}

              <Icon
                size={16}
                strokeWidth={active ? 2.4 : 2}
                className="relative z-10 transition-transform group-hover:scale-110"
              />
              <span className="relative z-10 hidden sm:inline">{item.name}</span>

              {/* Badge */}
              {badge !== undefined && badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative z-10 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background"
                >
                  {badge > 99 ? '99+' : badge}
                </motion.span>
              )}

              {/* Keyboard shortcut hint on hover */}
              {!active && item.shortcut && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-md border border-border bg-popover px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground opacity-0 shadow-float transition-opacity group-hover:opacity-100">
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Right arrow */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => scrollByAmount(1)}
            className="cf-focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Scroll menu right"
          >
            <ChevronRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Divider */}
      <span className="mx-0.5 hidden h-7 w-px bg-border/60 sm:block" />

      {/* Quick actions on right */}
      <button
        onClick={() => useApp.getState().setView('notifications')}
        className="cf-focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
        aria-label="More menu"
      >
        <MenuIcon size={16} />
      </button>

      {/* Quick upload FAB-style button */}
      <button
        onClick={() => useApp.getState().setUploadOpen(true)}
        className="cf-focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
        aria-label="Quick upload"
        title="Quick upload (⌘U)"
      >
        <Plus size={18} strokeWidth={2.4} />
      </button>
    </motion.nav>
  )
}
