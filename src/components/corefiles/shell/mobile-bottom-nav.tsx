/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, FolderTree, Bell, MoreHorizontal, Upload, type LucideIcon,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { cn } from '@/lib/utils'

/**
 * MobileBottomNav — floating glass bar fixed at the bottom for mobile only.
 *
 * Spec:
 *   - Mobile (≤767px) only — hidden at md+ (desktop uses FloatingDockNav)
 *   - Position: bottom 16px, left 16px, right 16px
 *   - Height: 64px (+ safe-area-inset-bottom padding for iPhone)
 *   - Border radius: 22px
 *   - Glass background, blur, soft shadow
 *   - 5 items max: Home | Files | [FAB Upload] | Notifications | Profile
 *   - Center FAB: green circular, elevated, navigates to /upload
 *   - Active item: green; inactive: gray
 *   - Ripple effect + scale animation + haptic feedback (if supported)
 */
export function MobileBottomNav() {
  const { user, view, setView, setBreadcrumbs, notifications, setMoreSheetOpen } = useApp()
  const unread = notifications.filter(n => !n.read).length

  // Haptic feedback (where supported)
  const haptic = React.useCallback((pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(pattern) } catch { /* ignore */ }
    }
  }, [])

  // Ripple effect on tap
  const createRipple = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const ripple = document.createElement('span')
    ripple.className = 'cf-ripple'
    ripple.style.width = ripple.style.height = `${size}px`
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    target.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }, [])

  type Item = {
    id: string
    label: string
    icon: LucideIcon
    view?: any
    badge?: number
    isFAB?: boolean
    onClick?: () => void
  }

  const items: Item[] = [
    { id: 'home', label: 'Home', icon: Home, view: 'dashboard' },
    { id: 'files', label: 'Files', icon: FolderTree, view: 'files' },
    { id: 'upload', label: 'Upload', icon: Upload, isFAB: true, onClick: () => {
      setView('upload')
      setBreadcrumbs([{ label: 'Upload Files', view: 'upload' }])
    }},
    { id: 'notifications', label: 'Alerts', icon: Bell, view: 'notifications', badge: unread },
    { id: 'profile', label: 'Profile', icon: MoreHorizontal, onClick: () => setMoreSheetOpen(true) },
  ]

  const handleItemClick = (item: Item, e: React.MouseEvent<HTMLElement>) => {
    haptic(10)
    createRipple(e)
    if (item.isFAB || item.onClick) {
      item.onClick?.()
    } else if (item.view) {
      setView(item.view)
      setBreadcrumbs([{ label: item.label, view: item.view }])
    }
  }

  const isActive = (item: Item) => {
    if (item.isFAB) return false
    if (item.id === 'profile') return false
    return view === item.view
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28 }}
      // Spec: bottom 16px, left 16px, right 16px, h 64px, radius 22px, glass + shadow + safe-area
      className="glass-mobile-nav fixed bottom-4 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-[22px] px-2 cf-safe-bottom md:hidden"
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      {items.map((item) => {
        if (item.isFAB) {
          // Center FAB — elevated green circular button
          return (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(item, e)}
              className="cf-focus-ring relative -mt-6 grid h-14 w-14 shrink-0 place-items-center rounded-full fab-mobile text-white"
              aria-label={item.label}
            >
              <motion.span
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <item.icon size={22} strokeWidth={2.4} />
              </motion.span>
            </button>
          )
        }

        const active = isActive(item)
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={(e) => handleItemClick(item, e)}
            className="cf-focus-ring cf-tap relative flex flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden py-1.5"
            aria-current={active ? 'page' : undefined}
            aria-label={item.label}
          >
            {/* Active indicator dot at top */}
            {active && (
              <motion.span
                layoutId="mobile-nav-active-dot"
                className="absolute top-1 h-1 w-1 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            {/* Icon + badge */}
            <div className="relative">
              <Icon
                size={20}
                strokeWidth={active ? 2.4 : 2}
                className={cn('transition-colors', active ? 'text-primary' : 'text-muted-foreground')}
              />
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white ring-2 ring-background"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </motion.span>
              )}
            </div>

            {/* Label */}
            <span className={cn(
              'text-[9px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>

            {/* Profile item shows user avatar as the icon when on settings page */}
            {item.id === 'profile' && user && (
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        )
      })}
    </motion.nav>
  )
}
