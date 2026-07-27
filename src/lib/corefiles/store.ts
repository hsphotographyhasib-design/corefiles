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
  | 'upload'
  | 'profile'
  | 'not-found'

export interface Workspace {
  id: string
  name: string
  color: string
  initials: string
}

/** Rich user profile — supports all fields per spec */
export interface UserProfile {
  id: string
  // Identity
  firstName: string
  lastName: string
  displayName: string
  username: string
  email: string
  role: RoleKey
  avatarUrl?: string  // data URL or remote URL
  // Professional
  employeeId: string
  jobTitle: string
  department: string
  company: string
  bio: string
  // Personal (optional)
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say' | ''
  // Locale
  timezone: string
  language: string
  // Contact
  phone: string
  mobile: string
  whatsapp: string
  officeExtension: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  // Security
  twoFactorEnabled: boolean
  recoveryEmail: string
  // Preferences
  theme: 'light' | 'dark' | 'system'
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY'
  timeFormat: '12h' | '24h'
  defaultLandingPage: ViewKey
  profileVisibility: 'public' | 'organization' | 'department' | 'private'
  // Notification settings
  notifEmail: boolean
  notifPush: boolean
  notifSecurityAlerts: boolean
  notifUploads: boolean
  notifMentions: boolean
  notifSystemUpdates: boolean
}

interface AppState {
  // Auth
  isAuthed: boolean
  user: UserProfile | null
  login: (role?: RoleKey) => void
  logout: () => void
  setRole: (role: RoleKey) => void
  updateUserProfile: (patch: Partial<UserProfile>) => void
  setUserAvatar: (avatarUrl: string | undefined) => void

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

  // Mobile "More" fullscreen sheet
  moreSheetOpen: boolean
  setMoreSheetOpen: (open: boolean) => void

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
      user: {
        id: 'u-1',
        firstName: 'Hasan',
        lastName: 'Rahman',
        displayName: 'Hasan Rahman',
        username: 'hasan.rahman',
        email: 'hasan@hasanurjaya.com',
        role,
        employeeId: 'HJ-001',
        jobTitle: 'Chief Executive Officer',
        department: 'Administration',
        company: 'Hasanur Jaya Sdn. Bhd.',
        bio: 'Founder & CEO of Hasanur Jaya Sdn. Bhd. — building Malaysia\'s most reliable engineering document management platform.',
        timezone: 'Asia/Kuala_Lumpur',
        language: 'en',
        phone: '+60 3-8941 2000',
        mobile: '+60 12-345 6789',
        whatsapp: '+60 12-345 6789',
        officeExtension: '1001',
        address: 'Level 12, Menara CIMB, Jalan Stesen Sentral 5',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        country: 'Malaysia',
        postalCode: '50470',
        twoFactorEnabled: true,
        recoveryEmail: 'hasan.backup@gmail.com',
        theme: 'system',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        defaultLandingPage: 'dashboard',
        profileVisibility: 'organization',
        notifEmail: true,
        notifPush: true,
        notifSecurityAlerts: true,
        notifUploads: true,
        notifMentions: true,
        notifSystemUpdates: false,
      },
      view: 'dashboard',
      breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
    }),
  logout: () => set({ isAuthed: false, user: null, view: 'dashboard' }),
  setRole: (role) => set((s) => ({ user: s.user ? { ...s.user, role } : s.user })),
  updateUserProfile: (patch) => set((s) => ({
    user: s.user ? { ...s.user, ...patch } : s.user,
  })),
  setUserAvatar: (avatarUrl) => set((s) => ({
    user: s.user ? { ...s.user, avatarUrl } : s.user,
  })),

  workspaces: defaultWorkspaces,
  currentWorkspaceId: 'ws-core',
  setWorkspace: (id) => set({ currentWorkspaceId: id }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),

  breadcrumbs: [{ label: 'Dashboard', view: 'dashboard' }],
  setBreadcrumbs: (b) => set({ breadcrumbs: b }),

  quickFindOpen: false,
  setQuickFind: (open) => set({ quickFindOpen: open }),

  moreSheetOpen: false,
  setMoreSheetOpen: (open) => set({ moreSheetOpen: open }),

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
