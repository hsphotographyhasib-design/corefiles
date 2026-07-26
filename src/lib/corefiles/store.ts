'use client'

import { create } from 'zustand'
import { notifications as initialNotifications, type NotificationItem } from '@/components/corefiles/data/mock'
import type { RoleKey } from '@/components/corefiles/data/menu'

export type ViewKey =
  | 'dashboard'
  | 'files'
  | 'folders'
  | 'favorites'
  | 'recent'
  | 'shared'
  | 'downloads'
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
  | 'support'
  | 'not-found'

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

  // Workspace selector
  workspaces: Workspace[]
  currentWorkspaceId: string
  setWorkspace: (id: string) => void

  // Navigation (horizontal dock)
  view: ViewKey
  setView: (v: ViewKey) => void

  // Breadcrumbs
  breadcrumbs: { label: string; view?: ViewKey; folderId?: string }[]
  setBreadcrumbs: (b: { label: string; view?: ViewKey; folderId?: string }[]) => void

  // Quick find (⌘K)
  quickFindOpen: boolean
  setQuickFind: (open: boolean) => void

  // Notifications
  notifications: NotificationItem[]
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  unreadCount: () => number

  // Selected file
  selectedFileId: string | null
  setSelectedFile: (id: string | null) => void

  // Folder navigation
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
      breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
    }),
  logout: () => set({ isAuthed: false, user: null, view: 'dashboard' }),
  setRole: (role) => set((s) => ({ user: s.user ? { ...s.user, role } : s.user })),

  workspaces: defaultWorkspaces,
  currentWorkspaceId: 'ws-core',
  setWorkspace: (id) => set({ currentWorkspaceId: id }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),

  breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
  setBreadcrumbs: (b) => set({ breadcrumbs: b }),

  quickFindOpen: false,
  setQuickFind: (open) => set({ quickFindOpen: open }),

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
