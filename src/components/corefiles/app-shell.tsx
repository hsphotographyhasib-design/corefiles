'use client'

import * as React from 'react'
import { useApp } from '@/lib/corefiles/store'
import { FloatingHeader } from '@/components/corefiles/shell/floating-topbar'
import { FloatingDockNav } from '@/components/corefiles/shell/floating-dock-nav'
import { FloatingContent } from '@/components/corefiles/shell/floating-content'
import { QuickFind } from '@/components/corefiles/shell/quick-find'
import { UploadModal } from '@/components/corefiles/shell/upload-modal'
import { ToastBridge } from '@/components/corefiles/common/toast-bridge'
import { RoleSwitcher } from '@/components/corefiles/shell/role-switcher'
import { LoginScreen } from '@/components/corefiles/views/login'
import { DashboardView } from '@/components/corefiles/views/dashboard'
import { FileManagerView } from '@/components/corefiles/views/files'
import { UsersView } from '@/components/corefiles/views/users'
import { RolesView } from '@/components/corefiles/views/roles'
import { DepartmentsView } from '@/components/corefiles/views/departments'
import { AuditLogsView, LoginLogsView, ActivityLogsView } from '@/components/corefiles/views/logs'
import { NotificationsView } from '@/components/corefiles/views/notifications'
import { ReportsView } from '@/components/corefiles/views/reports'
import { AdminView } from '@/components/corefiles/views/admin'
import { MonitoringView } from '@/components/corefiles/views/monitoring'
import { SettingsView } from '@/components/corefiles/views/settings'
import { FavoritesView, RecentView, TrashView, SearchView } from '@/components/corefiles/views/collections'

function ViewRenderer({ view }: { view: string }) {
  switch (view) {
    case 'dashboard': return <DashboardView />
    case 'files': return <FileManagerView />
    case 'favorites': return <FavoritesView />
    case 'recent': return <RecentView />
    case 'search': return <SearchView />
    case 'trash': return <TrashView />
    case 'users': return <UsersView />
    case 'roles': return <RolesView />
    case 'departments': return <DepartmentsView />
    case 'audit-logs': return <AuditLogsView />
    case 'login-logs': return <LoginLogsView />
    case 'activity-logs': return <ActivityLogsView />
    case 'notifications': return <NotificationsView />
    case 'reports': return <ReportsView />
    case 'admin': return <AdminView />
    case 'monitoring': return <MonitoringView />
    case 'settings': return <SettingsView />
    default: return <DashboardView />
  }
}

/**
 * AppShell — the CoreFiles horizontal-dock layout.
 *
 * NO LEFT SIDEBAR. NO VERTICAL NAVIGATION.
 *
 * Three independent floating layers stacked vertically:
 *
 *   ┌─ Header (top: 20, h: 72, L/R: 20) ─────────────────────────┐
 *   │  Logo  Workspace   Search   Upload 🔔 🌙 👤              │
 *   ├────────────────────────── 16px gap ────────────────────────┤
 *   ├─ Dock (top: 108, h: 64, max-w: 1400, rounded-full) ────────┤
 *   │  🏠 Dashboard │ 📁 Files │ 👥 Users │ 📊 Reports │ ⚙ Settings │
 *   ├────────────────────────── 20px gap ────────────────────────┤
 *   ┌─ Content (top: 192, L/R/Bottom: 20) ───────────────────────┐
 *   │  Breadcrumbs                                                 │
 *   │  [active view content]                                       │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * The dock is horizontally scrollable, drag-able, snap-scrolling, with
 * arrow buttons and keyboard ← → navigation.
 */
export function AppShell() {
  const { isAuthed, view } = useApp()

  if (!isAuthed) return <LoginScreen />

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layer 1 — Floating Header (always visible) */}
      <FloatingHeader />

      {/* Layer 2 — Floating Horizontal Dock Nav (NO LEFT SIDEBAR) */}
      <FloatingDockNav />

      {/* Layer 3 — Floating Content Card (full width below dock) */}
      <FloatingContent>
        <ViewRenderer view={view} />
      </FloatingContent>

      {/* Global overlays */}
      <QuickFind />
      <UploadModal />
      <ToastBridge />
      <RoleSwitcher />
    </div>
  )
}
