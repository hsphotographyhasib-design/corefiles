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
  navUserOverride: boolean // true = user explicitly toggled
  setNavState: (s: NavState) => void
  toggleNav: () => void
  collapseNav: () => void
  expandNav: () => void

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
      navState: 'expanded',
      navUserOverride: false,
      breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
    }),
  logout: () => set({ isAuthed: false, user: null, view: 'dashboard' }),
  setRole: (role) => set((s) => ({ user: s.user ? { ...s.user, role } : s.user })),

  workspaces: defaultWorkspaces,
  currentWorkspaceId: 'ws-core',
  setWorkspace: (id) => set({ currentWorkspaceId: id }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),

  navState: 'expanded',
  navUserOverride: false,
  setNavState: (s) => set({ navState: s, navUserOverride: true }),
  toggleNav: () => set((s) => {
    const next: NavState = s.navState === 'expanded' ? 'collapsed' : 'expanded'
    return { navState: next, navUserOverride: true }
  }),
  collapseNav: () => set({ navState: 'collapsed', navUserOverride: true }),
  expandNav: () => set({ navState: 'expanded', navUserOverride: false }),

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
