'use client'

import { create } from 'zustand'
import { notifications as initialNotifications, type NotificationItem } from '@/components/corefiles/data/mock'
import type { RoleKey } from '@/components/corefiles/data/menu'

export type ViewKey =
  | 'dashboard'
  | 'files'
  | 'favorites'
  | 'recent'
  | 'trash'
  | 'search'
  | 'users'
  | 'roles'
  | 'departments'
  | 'notifications'
  | 'audit-logs'
  | 'login-logs'
  | 'activity-logs'
  | 'reports'
  | 'admin'
  | 'monitoring'
  | 'settings'

/** Three-state floating navigation */
export type NavState = 'expanded' | 'collapsed' | 'hidden'

export interface Workspace {
  id: string
  name: string
  color: string
  initials: string
}

const NAV_STATE_KEY = 'corefiles:nav-state'
const NAV_OVERRIDE_KEY = 'corefiles:nav-override'

/** Read persisted nav state on client (SSR-safe — defaults to expanded). */
function readNavState(): NavState {
  if (typeof window === 'undefined') return 'expanded'
  try {
    const v = localStorage.getItem(NAV_STATE_KEY)
    return v === 'collapsed' || v === 'hidden' || v === 'expanded' ? v : 'expanded'
  } catch { return 'expanded' }
}

function readNavOverride(): boolean {
  if (typeof window === 'undefined') return false
  try { return localStorage.getItem(NAV_OVERRIDE_KEY) === 'true' } catch { return false }
}

function persistNavState(state: NavState, override: boolean) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NAV_STATE_KEY, state)
    localStorage.setItem(NAV_OVERRIDE_KEY, String(override))
  } catch { /* ignore */ }
}

interface AppState {
  // Auth
  isAuthed: boolean
  user: { id: string; name: string; email: string; role: RoleKey } | null
  login: (role?: RoleKey) => void
  logout: () => void
  setRole: (role: RoleKey) => void

  // Workspace selector (multi-org support)
  workspaces: Workspace[]
  currentWorkspaceId: string
  setWorkspace: (id: string) => void

  // Navigation
  view: ViewKey
  setView: (v: ViewKey) => void

  // Floating nav state — 'auto' lets user override the smart auto-hide
  navState: NavState
  navUserOverride: boolean
  setNavState: (s: NavState) => void
  toggleNav: () => void
  cycleNav: () => void
  collapseNav: () => void
  expandNav: () => void
  hideNav: () => void

  // Tablet drawer
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void

  // Breadcrumbs (clickable)
  breadcrumbs: { label: string; view?: ViewKey; folderId?: string }[]
  setBreadcrumbs: (b: { label: string; view?: ViewKey; folderId?: string }[]) => void

  // Quick find (⌘K command palette)
  quickFindOpen: boolean
  setQuickFind: (open: boolean) => void

  // Upload modal
  uploadOpen: boolean
  setUploadOpen: (open: boolean) => void

  // Notifications
  notifications: NotificationItem[]
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  unreadCount: () => number

  // Selected file (for preview panel)
  selectedFileId: string | null
  setSelectedFile: (id: string | null) => void

  // Folder navigation (for File Manager)
  currentFolderId: string
  setCurrentFolder: (id: string) => void

  // Toast bridge
  toast: (msg: string, variant?: 'success' | 'error' | 'info') => void
}

const defaultWorkspaces: Workspace[] = [
  { id: 'ws-core', name: 'Hasanur Jaya', color: '#10b981', initials: 'HJ' },
  { id: 'ws-proj', name: 'Project Sites', color: '#0ea5e9', initials: 'PS' },
  { id: 'ws-arch', name: 'Architecture', color: '#8b5cf6', initials: 'AR' },
]

export const useApp = create<AppState>((set, get) => ({
  isAuthed: false,
  user: null,
  login: (role: RoleKey = 'Super Admin') =>
    set({
      isAuthed: true,
      user: { id: 'u-1', name: 'Hasan Rahman', email: 'hasan@hasanurjaya.com', role },
      view: 'dashboard',
      navState: readNavState(),
      navUserOverride: readNavOverride(),
      breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
    }),
  logout: () => set({ isAuthed: false, user: null, view: 'dashboard' }),
  setRole: (role) => set((s) => ({ user: s.user ? { ...s.user, role } : s.user })),

  workspaces: defaultWorkspaces,
  currentWorkspaceId: 'ws-core',
  setWorkspace: (id) => set({ currentWorkspaceId: id }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),

  navState: readNavState(),
  navUserOverride: readNavOverride(),
  setNavState: (s) => {
    persistNavState(s, true)
    set({ navState: s, navUserOverride: true })
  },
  toggleNav: () => {
    const next: NavState = get().navState === 'expanded' ? 'collapsed' : 'expanded'
    persistNavState(next, true)
    set({ navState: next, navUserOverride: true })
  },
  cycleNav: () => {
    const cur = get().navState
    const next: NavState = cur === 'expanded' ? 'collapsed' : cur === 'collapsed' ? 'hidden' : 'expanded'
    persistNavState(next, true)
    set({ navState: next, navUserOverride: true })
  },
  collapseNav: () => {
    persistNavState('collapsed', get().navUserOverride)
    set({ navState: 'collapsed' })
  },
  expandNav: () => {
    // Smart expand (hover, focus) — does NOT mark as user override
    set({ navState: 'expanded' })
  },
  hideNav: () => {
    persistNavState('hidden', true)
    set({ navState: 'hidden', navUserOverride: true })
  },

  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),

  breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
  setBreadcrumbs: (b) => set({ breadcrumbs: b }),

  quickFindOpen: false,
  setQuickFind: (open) => set({ quickFindOpen: open }),

  uploadOpen: false,
  setUploadOpen: (open) => set({ uploadOpen: open }),

  notifications: initialNotifications,
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  selectedFileId: null,
  setSelectedFile: (id) => set({ selectedFileId: id }),

  currentFolderId: 'f-root',
  setCurrentFolder: (id) => set({ currentFolderId: id }),

  toast: (msg, variant = 'success') => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('cf-toast', { detail: { msg, variant } })
      window.dispatchEvent(event)
    }
  },
}))
