'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/corefiles/store'
import { getMobileMenu, type RoleKey } from '@/components/corefiles/data/menu'
import { Avatar } from '@/components/corefiles/common/avatar'
import { Upload, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * MobileBottomNav — floating glass bar fixed at bottom with center FAB.
 *
 * Layout: [ Dashboard | Files ] [ FAB Upload ] [ Notifications | Profile ]
 *
 * Spec:
 *   - Mobile: Header + Bottom Floating Navigation + Floating FAB Upload
 *   - Hidden at md+ (where FloatingLeftNav takes over)
 */
export function MobileBottomNav() {
  const { user, view, setView, setUploadOpen, notifications, setBreadcrumbs } = useApp()
  const role = (user?.role || 'Employee') as RoleKey
  const items = React.useMemo(() => getMobileMenu(role), [role])
  const unread = notifications.filter(n => !n.read).length

  const leftItems = items.slice(0, 2)
  const rightItems = items.slice(3, 5)

  const handleClick = (item: typeof items[0]) => {
    if (item.id === 'm-fab-upload') return
    setView(item.url)
    setBreadcrumbs([{ label: item.name, view: item.url }])
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 28 }}
      // Fixed at bottom: floating glass bar with FAB
      className="glass-mobile fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-3xl px-2 py-2.5 md:hidden"
      aria-label="Mobile navigation"
    >
      {/* Left items */}
      <div className="flex flex-1 items-center justify-around gap-1">
        {leftItems.map(item => {
          const Icon = item.icon
          const active = view === item.url && item.id !== 'm-folders' && item.id !== 'm-shared'
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="cf-focus-ring relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5"
              aria-label={item.name}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                size={20}
                className={cn('transition-colors', active ? 'text-primary' : 'text-muted-foreground')}
                strokeWidth={active ? 2.4 : 2}
              />
              <span className={cn('text-[9px] font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                {item.name}
              </span>
              {active && (
                <motion.span
                  layoutId="mobile-active-dot"
                  className="absolute -mt-0.5 h-1 w-1 rounded-full bg-primary"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Center FAB — Upload */}
      <div className="px-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setUploadOpen(true)}
          className="fab-gradient grid h-14 w-14 -translate-y-3 place-items-center rounded-2xl text-white"
          aria-label="Quick upload"
        >
          <Upload size={22} strokeWidth={2.4} />
        </motion.button>
      </div>

      {/* Right items */}
      <div className="flex flex-1 items-center justify-around gap-1">
        {rightItems.map((item) => {
          const isNotif = item.id === 'm-notifications'
          const active = view === item.url
          const Icon = isNotif ? Bell : item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="cf-focus-ring relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5"
              aria-label={item.name}
              aria-current={active ? 'page' : undefined}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={cn('transition-colors', active ? 'text-primary' : 'text-muted-foreground')}
                  strokeWidth={active ? 2.4 : 2}
                />
                {isNotif && unread > 0 && (
                  <span className="absolute -right-1.5 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-background">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </div>
              <span className={cn('text-[9px] font-medium', active ? 'text-primary' : 'text-muted-foreground')}>
                {item.name}
              </span>
              {active && (
                <motion.span
                  layoutId="mobile-active-dot-right"
                  className="absolute -mt-0.5 h-1 w-1 rounded-full bg-primary"
                />
              )}
            </button>
          )
        })}
        {/* Profile avatar shortcut */}
        <button
          onClick={() => { setView('settings'); setBreadcrumbs([{ label: 'Settings', view: 'settings' }]) }}
          className="cf-focus-ring flex flex-col items-center gap-0.5 rounded-xl px-2 py-1"
          aria-label="Profile"
        >
          <Avatar name={user?.name || 'User'} size={22} />
          <span className="text-[9px] font-medium text-muted-foreground">Me</span>
        </button>
      </div>
    </motion.nav>
  )
}
