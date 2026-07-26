'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/corefiles/store'
import { Sidebar } from '@/components/corefiles/shell/sidebar'
import { TopBar } from '@/components/corefiles/shell/topbar'
import { QuickFind } from '@/components/corefiles/shell/quick-find'
import { UploadModal } from '@/components/corefiles/shell/upload-modal'
import { ToastBridge } from '@/components/corefiles/common/toast-bridge'
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
  const { isAuthed, view, sidebarCollapsed } = useApp()

  if (!isAuthed) return <LoginScreen />

  return (
    <div className="flex min-h-screen gap-0 p-4">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="flex-1 px-0 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ViewRenderer view={view} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <QuickFind />
      <UploadModal />
      <ToastBridge />
    </div>
  )
}
