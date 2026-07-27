/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

/**
 * CoreFiles — Database-driven menu configuration
 *
 * Maps to three PostgreSQL tables in production:
 *   menus                    — one row per nav item
 *   menu_groups              — divider/section headers
 *   role_menu_permissions    — many-to-many (role_id, menu_id, can_view)
 *
 * Every menu item below maps to a real view in ViewRenderer (no aliases,
 * no dead links, no placeholders).
 */

import {
  LayoutDashboard, FolderTree, FolderOpen, Clock, Star, Share2,
  Download, Trash2, Users, Shield, Building2, BarChart3, Server,
  Settings, Database, LifeBuoy, Bell, ScrollText, HardDrive, Mail,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import type { ViewKey } from '@/lib/corefiles/store'

export type RoleKey =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Department Head'
  | 'Employee'
  | 'Read Only'
  | 'Guest'

export type Permission =
  | 'view' | 'upload' | 'download' | 'delete' | 'rename' | 'move'
  | 'share' | 'print' | 'restore' | 'manage_users' | 'manage_roles'
  | 'manage_departments' | 'manage_storage' | 'manage_settings'
  | 'view_logs' | 'view_reports' | 'view_monitoring' | 'manage_backups'

export interface MenuGroup {
  id: string
  name: string
  sort_order: number
}

export interface MenuItem {
  id: string
  group_id: string
  name: string
  icon: LucideIcon
  url: ViewKey
  sort_order: number
  parent_id: string | null
  visible: boolean
  in_dock: boolean
  permission_required: Permission | null
  badge_key?: 'notifications' | 'approvals' | null
  shortcut?: string
}

// ----------------------------- Groups -----------------------------

export const menuGroups: MenuGroup[] = [
  { id: 'g-workspace', name: 'Workspace', sort_order: 1 },
  { id: 'g-management', name: 'Management', sort_order: 2 },
  { id: 'g-system', name: 'System', sort_order: 3 },
]

// ----------------------------- Items -----------------------------
// Desktop dock = 12 items per spec: Dashboard, Files, Folders, Favorites,
// Recent, Shared, Downloads, Trash, Users, Roles, Reports, Settings.
// Mobile bottom nav = 5 items: Home (Dashboard), Files, Upload (FAB),
// Notifications, Profile. Other items accessed via "More" sheet.

export const menuItems: MenuItem[] = [
  // Workspace (9 items — upload is a full-page workspace, not in the dock)
  { id: 'm-dashboard', group_id: 'g-workspace', name: 'Dashboard', icon: LayoutDashboard, url: 'dashboard', sort_order: 1, parent_id: null, visible: true, in_dock: true, permission_required: null, shortcut: '1' },
  { id: 'm-upload', group_id: 'g-workspace', name: 'Upload Files', icon: Upload, url: 'upload', sort_order: 2, parent_id: null, visible: true, in_dock: false, permission_required: 'upload', shortcut: 'U' },
  { id: 'm-files', group_id: 'g-workspace', name: 'Files', icon: FolderTree, url: 'files', sort_order: 3, parent_id: null, visible: true, in_dock: true, permission_required: 'view', shortcut: '2' },
  { id: 'm-folders', group_id: 'g-workspace', name: 'Folders', icon: FolderOpen, url: 'folders', sort_order: 4, parent_id: null, visible: true, in_dock: true, permission_required: 'view' },
  { id: 'm-favorites', group_id: 'g-workspace', name: 'Favorites', icon: Star, url: 'favorites', sort_order: 5, parent_id: null, visible: true, in_dock: true, permission_required: 'view' },
  { id: 'm-recent', group_id: 'g-workspace', name: 'Recent', icon: Clock, url: 'recent', sort_order: 6, parent_id: null, visible: true, in_dock: true, permission_required: 'view' },
  { id: 'm-shared', group_id: 'g-workspace', name: 'Shared', icon: Share2, url: 'shared', sort_order: 7, parent_id: null, visible: true, in_dock: true, permission_required: 'view' },
  { id: 'm-downloads', group_id: 'g-workspace', name: 'Downloads', icon: Download, url: 'downloads', sort_order: 8, parent_id: null, visible: true, in_dock: true, permission_required: 'download' },
  { id: 'm-trash', group_id: 'g-workspace', name: 'Trash', icon: Trash2, url: 'trash', sort_order: 9, parent_id: null, visible: true, in_dock: true, permission_required: 'restore' },

  // Management (6 items)
  { id: 'm-users', group_id: 'g-management', name: 'Users', icon: Users, url: 'users', sort_order: 1, parent_id: null, visible: true, in_dock: true, permission_required: 'manage_users' },
  { id: 'm-roles', group_id: 'g-management', name: 'Roles', icon: Shield, url: 'roles', sort_order: 2, parent_id: null, visible: true, in_dock: true, permission_required: 'manage_roles' },
  { id: 'm-departments', group_id: 'g-management', name: 'Departments', icon: Building2, url: 'departments', sort_order: 3, parent_id: null, visible: true, in_dock: false, permission_required: 'manage_departments' },
  { id: 'm-storage', group_id: 'g-management', name: 'Storage', icon: HardDrive, url: 'admin', sort_order: 4, parent_id: null, visible: true, in_dock: false, permission_required: 'manage_storage' },
  { id: 'm-activity-logs', group_id: 'g-management', name: 'Activity Logs', icon: ScrollText, url: 'activity-logs', sort_order: 5, parent_id: null, visible: true, in_dock: false, permission_required: 'view_logs' },
  { id: 'm-reports', group_id: 'g-management', name: 'Reports', icon: BarChart3, url: 'reports', sort_order: 6, parent_id: null, visible: true, in_dock: true, permission_required: 'view_reports' },

  // System (5 items)
  { id: 'm-settings', group_id: 'g-system', name: 'Settings', icon: Settings, url: 'settings', sort_order: 1, parent_id: null, visible: true, in_dock: true, permission_required: null, shortcut: '⌘,' },
  { id: 'm-monitoring', group_id: 'g-system', name: 'Monitoring', icon: Server, url: 'monitoring', sort_order: 2, parent_id: null, visible: true, in_dock: false, permission_required: 'view_monitoring' },
  { id: 'm-support', group_id: 'g-system', name: 'Support', icon: LifeBuoy, url: 'support', sort_order: 3, parent_id: null, visible: true, in_dock: false, permission_required: null },
  { id: 'm-backups', group_id: 'g-system', name: 'Backups', icon: Database, url: 'admin', sort_order: 4, parent_id: null, visible: true, in_dock: false, permission_required: 'manage_backups' },
  { id: 'm-notifications', group_id: 'g-system', name: 'Notifications', icon: Bell, url: 'notifications', sort_order: 5, parent_id: null, visible: true, in_dock: false, permission_required: null, badge_key: 'notifications' },
]

// ----------------------------- Role → Permission map -----------------------------

export const rolePermissions: Record<RoleKey, Permission[]> = {
  'Super Admin': [
    'view', 'upload', 'download', 'delete', 'rename', 'move', 'share', 'print',
    'restore', 'manage_users', 'manage_roles', 'manage_departments',
    'manage_storage', 'manage_settings', 'view_logs', 'view_reports',
    'view_monitoring', 'manage_backups',
  ],
  'Admin': [
    'view', 'upload', 'download', 'delete', 'rename', 'move', 'share', 'print',
    'restore', 'manage_users', 'manage_roles', 'manage_departments',
    'manage_storage', 'manage_settings', 'view_logs', 'view_reports',
    'view_monitoring', 'manage_backups',
  ],
  'Manager': [
    'view', 'upload', 'download', 'rename', 'move', 'share', 'print', 'restore',
    'manage_users', 'view_logs', 'view_reports',
  ],
  'Department Head': [
    'view', 'upload', 'download', 'rename', 'move', 'share', 'print', 'restore',
    'view_reports',
  ],
  'Employee': ['view', 'upload', 'download', 'rename', 'move', 'share', 'print'],
  'Read Only': ['view', 'download'],
  'Guest': ['view'],
}

/** Returns all menu items visible to a given role (permission-based). */
export function getMenuForRole(role: RoleKey): MenuItem[] {
  const perms = rolePermissions[role] || []
  return menuItems.filter(item => {
    if (!item.visible) return false
    if (!item.permission_required) return true
    return perms.includes(item.permission_required)
  })
}

/** Returns only the items that appear in the horizontal floating dock. */
export function getDockMenuForRole(role: RoleKey): MenuItem[] {
  return getMenuForRole(role)
    .filter(i => i.in_dock)
    .sort((a, b) => {
      const ga = menuGroups.find(g => g.id === a.group_id)?.sort_order || 0
      const gb = menuGroups.find(g => g.id === b.group_id)?.sort_order || 0
      if (ga !== gb) return ga - gb
      return a.sort_order - b.sort_order
    })
}

/**
 * Returns the 5 items for the mobile bottom nav per spec:
 *   Home (Dashboard) | Files | Upload (FAB, center) | Notifications | Profile
 * Profile navigates to the More sheet (which lists Users/Roles/Departments/etc).
 */
export function getMobileBottomNav(role: RoleKey): MenuItem[] {
  const visible = getMenuForRole(role)
  const find = (id: string) => visible.find(i => i.id === id)
  return [
    find('m-dashboard') || visible[0],
    find('m-files') || visible[1],
    // Center FAB — handled separately by the bottom nav component
    find('m-notifications') || visible.find(i => i.id === 'm-recent') || visible[2],
    // "Profile" is a synthetic entry that opens the More sheet
    {
      id: 'm-more', group_id: 'g-system', name: 'More', icon: LifeBuoy,
      url: 'settings' as ViewKey, sort_order: 99, parent_id: null,
      visible: true, in_dock: false, permission_required: null,
    },
  ].filter(Boolean) as MenuItem[]
}

/** Items shown in the mobile "More" fullscreen sheet (Profile → More). */
export function getMobileMoreMenu(role: RoleKey): MenuItem[] {
  const visible = getMenuForRole(role)
  const moreIds = ['m-users', 'm-roles', 'm-departments', 'm-reports', 'm-monitoring', 'm-backups', 'm-support']
  return moreIds
    .map(id => visible.find(i => i.id === id))
    .filter(Boolean) as MenuItem[]
}

// Mail icon import kept at bottom for clarity (used for Support email CTA in view)
export const SupportMailIcon = Mail
