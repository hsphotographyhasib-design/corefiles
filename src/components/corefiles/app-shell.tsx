'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/corefiles/store'
import { FloatingTopBar } from '@/components/corefiles/shell/floating-topbar'
import { FloatingLeftNav } from '@/components/corefiles/shell/floating-left-nav'
import { FloatingBreadcrumbs } from '@/components/corefiles/shell/floating-breadcrumbs'
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

export function AppShell() {
  const { isAuthed, view } = useApp()

  if (!isAuthed) return <LoginScreen />

  return (
    <div className="min-h-screen">
      {/* Floating top header */}
      <FloatingTopBar />

      {/* Breadcrumb row (below header, floats inside main container) */}
      <div className="mx-auto mt-3 w-[calc(100vw-2rem)] max-w-[1600px]">
        <FloatingBreadcrumbs />
      </div>

      {/* Main content with floating left nav */}
      <div className="mx-auto mt-3 flex w-[calc(100vw-2rem)] max-w-[1600px] gap-4 pb-32 md:pb-8">
        <FloatingLeftNav />

        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <ViewRenderer view={view} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating mobile bottom nav */}
      <MobileBottomNav />

      {/* Global modals & overlays */}
      <QuickFind />
      <UploadModal />
      <ToastBridge />

      {/* Demo: floating role switcher to preview permission-based menu */}
      <RoleSwitcher />
    </div>
  )
}
