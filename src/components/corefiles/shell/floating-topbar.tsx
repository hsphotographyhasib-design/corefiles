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
  Search, Bell, Upload, Sun, Moon, ChevronDown, Check, LogOut,
  User as UserIcon, Settings as SettingsIcon, Shield, UserCog,
  CheckCheck, Globe, Command, Boxes,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { useTheme } from 'next-themes'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const severityColor = {
  info: 'text-sky-500 bg-sky-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  critical: 'text-rose-500 bg-rose-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
]

export function FloatingHeader() {
  const {
    user, workspaces, currentWorkspaceId, setWorkspace,
    setQuickFind, notifications, markAllRead, markNotificationRead,
    setView,
  } = useApp()
  const { theme, setTheme } = useTheme()
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)
  const [lang, setLang] = React.useState('en')

  const notifRef = React.useRef<HTMLDivElement>(null)
  const profileRef = React.useRef<HTMLDivElement>(null)
  const workspaceRef = React.useRef<HTMLDivElement>(null)
  const langRef = React.useRef<HTMLDivElement>(null)
  const unread = notifications.filter(n => !n.read).length
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId)!

  // ⌘K (search) + ⌘U (upload workspace) keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setQuickFind(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        setView('upload')
        useApp.getState().setBreadcrumbs([{ label: 'Upload Files', view: 'upload' }])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setQuickFind, setView])

  // Close popovers on outside click
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false)
      if (workspaceRef.current && !workspaceRef.current.contains(t)) setWorkspaceOpen(false)
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      // Spec: mobile h 52px (top 16, L/R 16, radius 16px)
      // Tablet/Desktop h 56px (top 20, L/R 20, max-w 1720, radius 18px)
      className="glass-nav fixed left-4 right-4 top-4 z-50 mx-auto flex h-[52px] max-w-[1720px] items-center gap-2 rounded-2xl px-3 md:left-5 md:right-5 md:top-5 md:h-[56px] md:rounded-[18px] md:px-6"
      role="banner"
    >
      {/* LEFT — Logo + Workspace */}
      <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Logo */}
          <button
            onClick={() => useApp.getState().setView('dashboard')}
            className="cf-focus-ring flex items-center gap-2 rounded-xl px-1 py-0.5 transition-colors hover:bg-accent/50 md:gap-2.5 md:rounded-2xl md:px-1.5 md:py-1"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-glow md:h-10 md:w-10 md:rounded-2xl">
              <Boxes size={16} strokeWidth={2.4} className="md:hidden" />
              <Boxes size={20} strokeWidth={2.4} className="hidden md:block" />
            </div>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-bold brand-text md:text-base">CoreFiles</span>
              <span className="text-[10px] text-muted-foreground">Enterprise</span>
            </div>
          </button>

          {/* Workspace selector */}
          <div ref={workspaceRef} className="relative hidden lg:block">
            <button
              onClick={() => setWorkspaceOpen(o => !o)}
              className="cf-focus-ring flex items-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-2.5 py-2 transition-colors hover:bg-accent/60"
            >
              <span className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-bold text-white" style={{ background: currentWs.color }}>
                {currentWs.initials}
              </span>
              <span className="max-w-[140px] truncate text-sm font-medium">{currentWs.name}</span>
              <ChevronDown size={13} className={cn('text-muted-foreground transition-transform', workspaceOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {workspaceOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-nav absolute left-0 top-12 w-64 overflow-hidden rounded-2xl p-1.5"
                >
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</p>
                  {workspaces.map(w => (
                    <button
                      key={w.id}
                      onClick={() => { setWorkspace(w.id); setWorkspaceOpen(false); toast(`Switched to ${w.name}`) }}
                      className={cn('flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent', w.id === currentWorkspaceId && 'bg-accent/60')}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-md text-[10px] font-bold text-white" style={{ background: w.color }}>{w.initials}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{w.name}</p>
                        <p className="text-[10px] text-muted-foreground">Workspace</p>
                      </div>
                      {w.id === currentWorkspaceId && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                  <div className="my-1 h-px bg-border/60" />
                  <button
                    onClick={() => { setWorkspaceOpen(false); toast('Create workspace dialog opened') }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-primary hover:bg-accent"
                  >
                    <Building2 size={13} /> Create new workspace
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CENTER — Global search (compact icon on mobile, full bar on tablet+) */}
        <div className="mx-auto flex-1 px-1 sm:max-w-xl sm:px-2">
          <button
            onClick={() => setQuickFind(true)}
            className="group flex h-9 w-full items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-background/60 cf-focus-ring md:h-11 md:rounded-2xl md:px-4"
            aria-label="Search (⌘K)"
          >
            <Search size={15} className="shrink-0 md:hidden" />
            <Search size={16} className="hidden shrink-0 md:block" />
            <span className="hidden flex-1 text-left md:inline">Search files, folders, people, commands…</span>
            <kbd className="ml-auto hidden items-center gap-0.5 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium md:flex">
              <Command size={9} /> K
            </kbd>
          </button>
        </div>

        {/* RIGHT — Actions */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* Quick upload — navigates to full-page workspace */}
          <button
            onClick={() => {
              setView('upload')
              useApp.getState().setBreadcrumbs([{ label: 'Upload Files', view: 'upload' }])
            }}
            className="cf-focus-ring cf-tap flex h-8 items-center gap-1.5 rounded-xl bg-primary px-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:shadow-glow active:scale-[0.97] md:h-10 md:rounded-2xl md:px-4 md:text-sm"
            title="Open upload workspace (⌘U)"
            aria-label="Upload"
          >
            <Upload size={14} className="md:hidden" />
            <Upload size={15} className="hidden md:block" />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="cf-focus-ring cf-tap grid h-8 w-8 place-items-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 md:rounded-2xl"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                  <Sun size={15} className="md:hidden" />
                  <Sun size={16} className="hidden md:block" />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                  <Moon size={15} className="md:hidden" />
                  <Moon size={16} className="hidden md:block" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Language (desktop only per spec — hidden on mobile + tablet) */}
          <div ref={langRef} className="relative hidden lg:block">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="cf-focus-ring cf-tap grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Language"
              title="Language"
            >
              <Globe size={16} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-nav absolute right-0 top-12 w-44 overflow-hidden rounded-2xl p-1.5"
                >
                  {languages.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangOpen(false); toast(`Language: ${l.name}`) }}
                      className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors hover:bg-accent', lang === l.code && 'bg-accent/60')}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span className="flex-1 text-left">{l.name}</span>
                      {lang === l.code && <Check size={13} className="text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="cf-focus-ring cf-tap relative grid h-8 w-8 place-items-center rounded-xl border border-border/60 bg-background/40 text-muted-foreground transition-colors hover:text-foreground md:h-10 md:w-10 md:rounded-2xl"
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            >
              <Bell size={15} className="md:hidden" />
              <Bell size={16} className="hidden md:block" />
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-background"
                  >
                    {unread}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-nav absolute right-0 top-12 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl"
                >
                  <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
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
              className="cf-focus-ring cf-tap flex items-center gap-2 rounded-xl p-0.5 transition-colors hover:bg-accent/60 md:rounded-2xl md:p-1 md:pr-2"
              aria-label="Open profile menu"
            >
              <Avatar name={user?.displayName || user?.firstName || 'User'} size={28} online avatarUrl={user?.avatarUrl} />
              <span className="sr-only">Profile menu</span>
              <span className="hidden md:inline" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-nav absolute right-0 top-12 w-64 overflow-hidden rounded-2xl"
                >
                  <div className="flex items-center gap-3 border-b border-border/60 p-4">
                    <Avatar name={user?.displayName || user?.firstName || 'User'} size={40} online avatarUrl={user?.avatarUrl} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user?.displayName || user?.firstName}</p>
                      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">{user?.role}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { label: 'My Profile', icon: UserIcon, view: 'profile' as const },
                      { label: 'Security & 2FA', icon: Shield, view: 'profile' as const },
                      { label: 'Admin Panel', icon: UserCog, view: 'admin' as const },
                      { label: 'Settings', icon: SettingsIcon, view: 'settings' as const },
                      { label: 'About CoreFiles', icon: Boxes, view: 'about' as const },
                      { label: 'System Info', icon: Shield, view: 'system-info' as const },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={() => { setProfileOpen(false); setView(item.view); useApp.getState().setBreadcrumbs([{ label: item.label, view: item.view }]) }}
                        className="cf-focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <item.icon size={15} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border/60 p-2">
                    <button
                      onClick={() => useApp.getState().logout()}
                      className="cf-focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
    </motion.header>
  )
}

// Need Building2 import — kept at bottom for clarity
import { Building2 } from 'lucide-react'
