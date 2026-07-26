'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FolderTree, Star, Clock, Trash2, Search, Users, Shield,
  Building2, Bell, FileText, ScrollText, BarChart3, Settings, Server,
  ChevronLeft, ChevronRight, Boxes, LogOut, Sparkles, FolderClosed,
} from 'lucide-react'
import { useApp, type ViewKey } from '@/lib/corefiles/store'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

type NavItem = { key: ViewKey; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; group: string; badge?: number }

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Workspace' },
  { key: 'files', label: 'File Manager', icon: FolderTree, group: 'Workspace' },
  { key: 'favorites', label: 'Favorites', icon: Star, group: 'Workspace' },
  { key: 'recent', label: 'Recent Files', icon: Clock, group: 'Workspace' },
  { key: 'search', label: 'Global Search', icon: Search, group: 'Workspace' },
  { key: 'trash', label: 'Recycle Bin', icon: Trash2, group: 'Workspace' },

  { key: 'users', label: 'Users', icon: Users, group: 'Administration' },
  { key: 'roles', label: 'Roles & Permissions', icon: Shield, group: 'Administration' },
  { key: 'departments', label: 'Departments', icon: Building2, group: 'Administration' },
  { key: 'admin', label: 'Admin Panel', icon: Boxes, group: 'Administration' },

  { key: 'audit-logs', label: 'Audit Logs', icon: ScrollText, group: 'Logs & Reports' },
  { key: 'login-logs', label: 'Login Logs', icon: FileText, group: 'Logs & Reports' },
  { key: 'activity-logs', label: 'File Activity', icon: FolderClosed, group: 'Logs & Reports' },
  { key: 'reports', label: 'Reports', icon: BarChart3, group: 'Logs & Reports' },
  { key: 'monitoring', label: 'Server Monitoring', icon: Server, group: 'Logs & Reports' },

  { key: 'notifications', label: 'Notifications', icon: Bell, group: 'System', badge: 4 },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'System' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, view, setView, setBreadcrumbs, logout, notifications } = useApp()
  const unreadCount = notifications.filter(n => !n.read).length
  const { theme, setTheme } = useTheme()

  const groups = React.useMemo(() => {
    const g: Record<string, NavItem[]> = {}
    for (const item of navItems) (g[item.group] ||= []).push(item)
    return g
  }, [])

  const handleNav = (item: NavItem) => {
    setView(item.key)
    setBreadcrumbs([{ label: item.label, icon: '' }])
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 264 }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="sticky top-4 z-30 flex h-[calc(100vh-2rem)] flex-col"
    >
      <div className="glass-strong shadow-float flex h-full flex-col rounded-2xl p-3">
        {/* Brand */}
        <button
          onClick={() => handleNav(navItems[0])}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent/60"
        >
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-glow">
            <Boxes size={20} strokeWidth={2.4} />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="flex flex-col items-start"
              >
                <span className="text-base font-bold leading-tight brand-text">CoreFiles</span>
                <span className="text-[10px] text-muted-foreground leading-tight">Hasanur Jaya Sdn. Bhd.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="my-3 h-px bg-border/60" />

        {/* Nav */}
        <nav className="cf-scroll -mr-1 flex-1 space-y-4 overflow-y-auto pr-1">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              {!sidebarCollapsed && (
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = view === item.key
                  const Icon = item.icon
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => handleNav(item)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute -left-1 h-5 w-1 rounded-full bg-primary-foreground"
                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                          />
                        )}
                        <Icon size={18} className="shrink-0" strokeWidth={active ? 2.4 : 2} />
                        <AnimatePresence>
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              className="flex-1 text-left"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {!sidebarCollapsed && item.key === 'notifications' && unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount}
                          </span>
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
        <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Toggle theme"
          >
            <Sparkles size={18} />
            {!sidebarCollapsed && <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
            title="Sign out"
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 grid h-6 w-6 place-items-center rounded-full border border-border bg-background shadow-float transition-transform hover:scale-110"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  )
}
