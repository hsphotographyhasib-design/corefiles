'use client'

import { create } from 'zustand'
import { notifications as initialNotifications, type NotificationItem } from '@/components/corefiles/data/mock'

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

interface AppState {
  // Auth
  isAuthed: boolean
  user: { id: string; name: string; email: string; role: string } | null
  login: () => void
  logout: () => void

  // Navigation
  view: ViewKey
  setView: (v: ViewKey) => void
  breadcrumbs: { label: string; icon?: string }[]
  setBreadcrumbs: (b: { label: string; icon?: string }[]) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Quick find
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

  // Toast for demo actions
  toast: (msg: string, variant?: 'success' | 'error' | 'info') => void
}

export const useApp = create<AppState>((set, get) => ({
  isAuthed: false,
  user: null,
  login: () =>
    set({
      isAuthed: true,
      user: { id: 'u-1', name: 'Hasan Rahman', email: 'hasan@hasanurjaya.com', role: 'Super Admin' },
      view: 'dashboard',
      breadcrumbs: [{ label: 'Dashboard', icon: 'layout-dashboard' }],
    }),
  logout: () => set({ isAuthed: false, user: null, view: 'dashboard' }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),
  breadcrumbs: [{ label: 'Dashboard', icon: 'layout-dashboard' }],
  setBreadcrumbs: (b) => set({ breadcrumbs: b }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

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
