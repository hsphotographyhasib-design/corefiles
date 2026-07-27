'use client'

import * as React from 'react'
import { useApp } from '@/lib/corefiles/store'
import { FloatingHeader } from '@/components/corefiles/shell/floating-topbar'
import { FloatingDockNav } from '@/components/corefiles/shell/floating-dock-nav'
import { MobileBottomNav } from '@/components/corefiles/shell/mobile-bottom-nav'
import { MobileMoreSheet } from '@/components/corefiles/shell/mobile-more-sheet'
import { FloatingContent } from '@/components/corefiles/shell/floating-content'
import { QuickFind } from '@/components/corefiles/shell/quick-find'
import { UploadManager } from '@/components/corefiles/shell/upload-manager'
import { ToastBridge } from '@/components/corefiles/common/toast-bridge'
import { ErrorBoundary } from '@/components/corefiles/common/error-boundary'
import { RoleSwitcher } from '@/components/corefiles/shell/role-switcher'
import { LoginScreen } from '@/components/corefiles/views/login'
import { DashboardView } from '@/components/corefiles/views/dashboard'
import { FileManagerView } from '@/components/corefiles/views/files'
import { FoldersView } from '@/components/corefiles/views/folders'
import { SharedView } from '@/components/corefiles/views/shared'
import { DownloadsView } from '@/components/corefiles/views/downloads'
import { UsersView } from '@/components/corefiles/views/users'
import { RolesView } from '@/components/corefiles/views/roles'
import { DepartmentsView } from '@/components/corefiles/views/departments'
import { AuditLogsView, LoginLogsView, ActivityLogsView } from '@/components/corefiles/views/logs'
import { NotificationsView } from '@/components/corefiles/views/notifications'
import { ReportsView } from '@/components/corefiles/views/reports'
import { AdminView } from '@/components/corefiles/views/admin'
import { MonitoringView } from '@/components/corefiles/views/monitoring'
import { SettingsView } from '@/components/corefiles/views/settings'
import { SupportView } from '@/components/corefiles/views/support'
import { UploadWorkspaceView } from '@/components/corefiles/views/upload-workspace'
import { ProfileView } from '@/components/corefiles/profile/profile-view'
import { FavoritesView, RecentView, TrashView, SearchView } from '@/components/corefiles/views/collections'
import { NotFoundView } from '@/components/corefiles/views/not-found'
import {
  menuItems, rolePermissions, type RoleKey, type Permission,
} from '@/components/corefiles/data/menu'
import type { ViewKey } from '@/lib/corefiles/store'

/** All views in the system — keyed by ViewKey. */
const views: Record<string, React.ComponentType> = {
  'dashboard': DashboardView,
  'files': FileManagerView,
  'folders': FoldersView,
  'favorites': FavoritesView,
  'recent': RecentView,
  'shared': SharedView,
  'downloads': DownloadsView,
  'trash': TrashView,
  'search': SearchView,
  'users': UsersView,
  'roles': RolesView,
  'departments': DepartmentsView,
  'notifications': NotificationsView,
  'audit-logs': AuditLogsView,
  'login-logs': LoginLogsView,
  'activity-logs': ActivityLogsView,
  'reports': ReportsView,
  'admin': AdminView,
  'monitoring': MonitoringView,
  'settings': SettingsView,
  'support': SupportView,
  'upload': UploadWorkspaceView,
  'profile': ProfileView,
}

/**
 * Checks if a given role has permission to access a given view.
 * Returns 'ok' | 'not-found' | 'denied'.
 */
function checkPermission(view: ViewKey, role: RoleKey): 'ok' | 'not-found' | 'denied' {
  // Find the menu item that owns this view
  const item = menuItems.find(m => m.url === view)
  if (!item) {
    // Some views (audit-logs, login-logs, search, admin, not-found) are reachable
    // via Quick Find or breadcrumbs but not in the menu config. Allow them.
    if (['audit-logs', 'login-logs', 'search', 'admin', 'profile', 'not-found'].includes(view)) return 'ok'
    return 'not-found'
  }
  if (!item.permission_required) return 'ok'
  const perms = rolePermissions[role] || []
  return perms.includes(item.permission_required) ? 'ok' : 'denied'
}

function ViewRenderer({ view }: { view: ViewKey }) {
  const { user } = useApp()
  const role = (user?.role || 'Guest') as RoleKey

  // Permission check — frontend enforcement
  const status = checkPermission(view, role)
  if (status === 'not-found') return <NotFoundView variant="not-found" />
  if (status === 'denied') return <NotFoundView variant="permission-denied" />

  const ViewComponent = views[view]
  if (!ViewComponent) return <NotFoundView variant="not-found" />

  return (
    <ErrorBoundary view={view}>
      <ViewComponent />
    </ErrorBoundary>
  )
}

/**
 * AppShell — the CoreFiles horizontal-dock layout.
 *
 * NO LEFT SIDEBAR. NO VERTICAL NAVIGATION.
 *
 * Three independent floating layers stacked vertically:
 *   1. Floating Header (top: 20, h: 72, L/R: 20)
 *   2. Floating Dock Nav (top: 108, h: 64, max-w: 1400, pill)
 *   3. Floating Content (top: 192, L/R/Bottom: 20)
 *
 * Every view is wrapped in an ErrorBoundary so a runtime crash in one view
 * shows a professional error UI instead of a blank screen.
 * Every view is permission-checked before render — denied views show 403 UI.
 */
export function AppShell() {
  const { isAuthed, view } = useApp()

  if (!isAuthed) return <LoginScreen />

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingHeader />
      {/* Desktop only (lg+) — horizontal floating dock */}
      <FloatingDockNav />
      {/* Mobile only (≤767px) — floating bottom nav with center FAB */}
      <MobileBottomNav />
      {/* Mobile only — fullscreen sheet for Users/Roles/Reports/etc */}
      <MobileMoreSheet />
      <FloatingContent>
        <ViewRenderer view={view} />
      </FloatingContent>

      <QuickFind />
      <UploadManager />
      <ToastBridge />
      <RoleSwitcher />
    </div>
  )
}
