'use client'

import * as React from 'react'
import { useApp } from '@/lib/corefiles/store'
import { FloatingHeader } from '@/components/corefiles/shell/floating-topbar'
import { FloatingLeftNav } from '@/components/corefiles/shell/floating-left-nav'
import { FloatingContent } from '@/components/corefiles/shell/floating-content'
import { TabletNavDrawer } from '@/components/corefiles/shell/tablet-nav-drawer'
import { MobileBottomNav } from '@/components/corefiles/shell/mobile-bottom-nav'
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
 * AppShell — the CoreFiles floating layout.
 *
 * Two independent floating layers (header + nav) with a 16px visible gap between
 * them, plus a third floating layer (content) that also floats as its own card.
 * Everything is `position: fixed` with the spec-defined offsets so the page
 * background remains visible behind the glass surfaces — Arc Browser / VisionOS feel.
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │  (transparent page background — decorative gradients)   │
 *   │  ╭──────────────────────────────────────────────────╮    │
 *   │  │ HEADER  top: 20px, left/right: 20px, h: 72px    │    │
 *   │  ╰──────────────────────────────────────────────────╯    │
 *   │  ←16px gap→                                              │
 *   │  ╭──────────╮  ╭────────────────────────────────────╮    │
 *   │  │   NAV    │  │  CONTENT (floats as its own card)  │    │
 *   │  │ top:108  │  │  top: 108px, padding: 32px         │    │
 *   │  │ w: 280   │  │  left: 320px (when nav expanded)   │    │
 *   │  │          │  │                                    │    │
 *   │  ╰──────────╯  ╰────────────────────────────────────╯    │
 *   └──────────────────────────────────────────────────────────┘
 */
export function AppShell() {
  const { isAuthed, view } = useApp()

  if (!isAuthed) return <LoginScreen />

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layer 1 — Floating header (always visible, all breakpoints) */}
      <FloatingHeader />

      {/* Layer 2 — Floating left nav (desktop only; tablet/mobile uses drawer) */}
      <FloatingLeftNav />

      {/* Layer 2 alt — Overlay drawer for tablet/mobile when triggered */}
      <TabletNavDrawer />

      {/* Layer 3 — Floating content card (the main scroll container) */}
      <FloatingContent>
        <ViewRenderer view={view} />
      </FloatingContent>

      {/* Mobile bottom nav with FAB (replaces left nav on mobile) */}
      <MobileBottomNav />

      {/* Global overlays */}
      <QuickFind />
      <UploadModal />
      <ToastBridge />
      <RoleSwitcher />
    </div>
  )
}
