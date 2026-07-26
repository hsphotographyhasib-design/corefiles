'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Upload, ChevronRight, Sun, Moon, Command, UserCog,
  LogOut, Shield, Settings, User as UserIcon, CheckCheck,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const severityColor = {
  info: 'text-sky-500 bg-sky-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  critical: 'text-rose-500 bg-rose-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
}

export function TopBar() {
  const { user, setQuickFind, setUploadOpen, notifications, markAllRead, markNotificationRead, setView, breadcrumbs } = useApp()
  const { theme, setTheme } = useTheme()
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const notifRef = React.useRef<HTMLDivElement>(null)
  const profileRef = React.useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setQuickFind(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        setUploadOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setQuickFind, setUploadOpen])

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 px-4 pt-4 sm:-mx-6 sm:px-6">
      <div className="glass shadow-float flex h-14 items-center gap-2 rounded-2xl px-3 sm:px-4">
        {/* Breadcrumbs */}
        <nav className="hidden min-w-0 flex-1 items-center gap-1 text-sm sm:flex">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight size={14} className="text-muted-foreground/40" />}
              <span className={cn('truncate', i === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
        <div className="flex flex-1 items-center sm:hidden">
          <span className="truncate text-sm font-semibold">{breadcrumbs[breadcrumbs.length - 1]?.label}</span>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setQuickFind(true)}
          className="group flex h-9 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-background"
        >
          <Search size={15} />
          <span className="hidden md:inline">Search files, people, settings…</span>
          <kbd className="ml-2 hidden md:inline">⌘K</kbd>
        </button>

        {/* Quick upload */}
        <button
          onClick={() => setUploadOpen(true)}
          className="hidden h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:shadow-glow active:scale-95 sm:flex"
          title="Quick upload (⌘U)"
        >
          <Upload size={15} />
          Upload
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="glass-strong shadow-float absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
              >
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                </div>
                <div className="cf-scroll max-h-[60vh] overflow-y-auto">
                  {notifications.slice(0, 6).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markNotificationRead(n.id); setNotifOpen(false); setView('notifications') }}
                      className="flex w-full gap-3 border-b border-border/40 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                    >
                      <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg', severityColor[n.severity])}>
                        <Bell size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{n.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{n.description}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); setView('notifications') }}
                  className="block w-full bg-accent/40 py-2.5 text-center text-xs font-medium text-primary hover:bg-accent/60"
                >
                  View all notifications →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 rounded-xl pl-1 pr-2 transition-colors hover:bg-accent/60"
          >
            <Avatar name={user?.name || 'User'} size={32} online />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="glass-strong shadow-float absolute right-0 top-12 w-64 overflow-hidden rounded-2xl"
              >
                <div className="flex items-center gap-3 border-b border-border/60 p-4">
                  <Avatar name={user?.name || 'User'} size={40} online />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="p-2">
                  {[
                    { label: 'My Profile', icon: UserIcon, view: 'settings' as const },
                    { label: 'Security & 2FA', icon: Shield, view: 'settings' as const },
                    { label: 'Admin Panel', icon: UserCog, view: 'admin' as const },
                    { label: 'Settings', icon: Settings, view: 'settings' as const },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={() => { setProfileOpen(false); setView(item.view) }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <item.icon size={15} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border/60 p-2">
                  <button
                    onClick={() => useApp.getState().logout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile command hint */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground sm:hidden">
        <Command size={10} /> Tap search to use ⌘K commands
      </div>
    </header>
  )
}
