'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, ChevronRight, Settings, User as UserIcon, Shield } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { getMobileMoreMenu, type RoleKey, type MenuItem } from '@/components/corefiles/data/menu'
import { Avatar } from '@/components/corefiles/common/avatar'
import { cn } from '@/lib/utils'

/**
 * MobileMoreSheet — fullscreen sheet that slides up from the bottom.
 *
 * Triggered by the "Profile" item in MobileBottomNav.
 *
 * Spec contents:
 *   - User profile header (name, email, role badge)
 *   - Users, Roles, Departments, Reports, Monitoring, Backups, Support
 *   - Settings (always shown)
 *   - Logout
 *
 * Each item shows icon, name, and chevron. Selecting an item navigates and
 * closes the sheet. ESC + backdrop tap also close.
 */
export function MobileMoreSheet() {
  const { user, moreSheetOpen, setMoreSheetOpen, setView, setBreadcrumbs, logout } = useApp()
  const role = (user?.role || 'Employee') as RoleKey
  const items = React.useMemo(() => getMobileMoreMenu(role), [role])

  // ESC to close
  React.useEffect(() => {
    if (!moreSheetOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreSheetOpen(false) }
    window.addEventListener('keydown', handler)
    // Lock body scroll while sheet is open
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [moreSheetOpen, setMoreSheetOpen])

  const handleNavigate = (item: MenuItem) => {
    setView(item.url)
    setBreadcrumbs([{ label: item.name, view: item.url }])
    setMoreSheetOpen(false)
  }

  return (
    <AnimatePresence>
      {moreSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMoreSheetOpen(false)}
            aria-hidden
          />

          {/* Fullscreen sheet — slides up from bottom */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="sheet-fullscreen fixed bottom-0 left-0 right-0 top-12 z-50 flex flex-col overflow-hidden rounded-t-[28px] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="More menu"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1.5 w-10 rounded-full bg-border" />
            </div>

            {/* Header with close button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
              <h2 className="text-base font-semibold">Menu</h2>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-muted/40 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* User profile card */}
            <div className="m-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 p-4">
              <Avatar name={user?.displayName || user?.firstName || 'User'} size={48} online avatarUrl={user?.avatarUrl} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.displayName || user?.firstName}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <span className="mt-1 inline-block rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Scrollable nav list */}
            <div className="cf-scroll flex-1 overflow-y-auto px-4 pb-4">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Management
              </p>
              <div className="space-y-1">
                {items.slice(0, 4).map(item => (
                  <MoreSheetItem
                    key={item.id}
                    item={item}
                    onClick={() => handleNavigate(item)}
                  />
                ))}
              </div>

              <p className="mb-2 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                System
              </p>
              <div className="space-y-1">
                {items.slice(4).map(item => (
                  <MoreSheetItem
                    key={item.id}
                    item={item}
                    onClick={() => handleNavigate(item)}
                  />
                ))}

                {/* Settings (always shown) */}
                <button
                  onClick={() => handleNavigate({
                    id: 'm-settings', group_id: 'g-system', name: 'Settings',
                    icon: Settings, url: 'settings' as any, sort_order: 0,
                    parent_id: null, visible: true, in_dock: false,
                    permission_required: null,
                  } as MenuItem)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Settings size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">Settings</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                {/* Security & Profile */}
                <button
                  onClick={() => handleNavigate({
                    id: 'm-profile', group_id: 'g-system', name: 'My Profile',
                    icon: UserIcon, url: 'profile' as any, sort_order: 0,
                    parent_id: null, visible: true, in_dock: false,
                    permission_required: null,
                  } as MenuItem)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <UserIcon size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">My Profile</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>

                <button
                  onClick={() => handleNavigate({
                    id: 'm-security', group_id: 'g-system', name: 'Security & 2FA',
                    icon: Shield, url: 'profile' as any, sort_order: 0,
                    parent_id: null, visible: true, in_dock: false,
                    permission_required: null,
                  } as MenuItem)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 text-left active:scale-[0.98] transition-transform"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <Shield size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">Security & 2FA</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Logout */}
              <div className="mt-6">
                <button
                  onClick={() => { setMoreSheetOpen(false); logout() }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3 text-left text-rose-600 active:scale-[0.98] transition-transform"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
                    <LogOut size={16} />
                  </span>
                  <span className="flex-1 text-sm font-medium">Sign out</span>
                </button>
              </div>

              {/* Footer */}
              <p className="mt-6 text-center text-[10px] text-muted-foreground">
                CoreFiles v2.4.1 · Hasanur Jaya Sdn. Bhd.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function MoreSheetItem({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card/40 p-3 text-left active:scale-[0.98] transition-transform"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon size={16} />
      </span>
      <span className="flex-1 text-sm font-medium">{item.name}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  )
}
