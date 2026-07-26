'use client'

/**
 * CoreFiles — Database-driven menu configuration
 *
 * In production, this maps to three PostgreSQL tables:
 *
 *   menus                    — one row per nav item (id, name, icon, url, sort_order,
 *                             parent_id, visible, permission_required, badge_key)
 *   menu_groups              — divider/section headers (id, name, sort_order, icon)
 *   role_menu_permissions    — many-to-many (role_id, menu_id, can_view)
 *
 * For the sandbox preview we ship the equivalent data structure in TypeScript.
 * The renderer (`FloatingLeftNav`) consumes this structure verbatim, so swapping
 * in a real `/api/menus` response later is a drop-in replacement.
 */

import {
  LayoutDashboard, FolderTree, FolderOpen, Clock, Star, Share2,
  Download, Trash2, Users, Shield, Building2, HardDrive, ScrollText,
  BarChart3, Settings, Server, Database, LifeBuoy, Bell,
  type LucideIcon,
} from 'lucide-react'
import type { ViewKey } from '@/lib/corefiles/store'

/** Roles that map to the `roles` table */
export type RoleKey =
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Department Head'
  | 'Employee'
  | 'Read Only'
  | 'Guest'

/** Granular permission keys (RBAC) */
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
  permission_required: Permission | null
  badge_key?: 'notifications' | 'approvals' | null
  /** Optional shortcut hint shown in tooltip */
  shortcut?: string
}

// ----------------------------- Groups -----------------------------

export const menuGroups: MenuGroup[] = [
  { id: 'g-workspace', name: 'Workspace', sort_order: 1 },
  { id: 'g-management', name: 'Management', sort_order: 2 },
  { id: 'g-system', name: 'System', sort_order: 3 },
]

// ----------------------------- Items -----------------------------

export const menuItems: MenuItem[] = [
  // Workspace
  { id: 'm-dashboard', group_id: 'g-workspace', name: 'Dashboard', icon: LayoutDashboard, url: 'dashboard', sort_order: 1, parent_id: null, visible: true, permission_required: null, shortcut: 'G D' },
  { id: 'm-files', group_id: 'g-workspace', name: 'Files', icon: FolderTree, url: 'files', sort_order: 2, parent_id: null, visible: true, permission_required: 'view', shortcut: 'G F' },
  { id: 'm-folders', group_id: 'g-workspace', name: 'Folders', icon: FolderOpen, url: 'files', sort_order: 3, parent_id: null, visible: true, permission_required: 'view' },
  { id: 'm-recent', group_id: 'g-workspace', name: 'Recent', icon: Clock, url: 'recent', sort_order: 4, parent_id: null, visible: true, permission_required: 'view', shortcut: 'G R' },
  { id: 'm-favorites', group_id: 'g-workspace', name: 'Favorites', icon: Star, url: 'favorites', sort_order: 5, parent_id: null, visible: true, permission_required: 'view' },
  { id: 'm-shared', group_id: 'g-workspace', name: 'Shared', icon: Share2, url: 'files', sort_order: 6, parent_id: null, visible: true, permission_required: 'view' },
  { id: 'm-downloads', group_id: 'g-workspace', name: 'Downloads', icon: Download, url: 'recent', sort_order: 7, parent_id: null, visible: true, permission_required: 'download' },
  { id: 'm-trash', group_id: 'g-workspace', name: 'Trash', icon: Trash2, url: 'trash', sort_order: 8, parent_id: null, visible: true, permission_required: 'restore' },

  // Management
  { id: 'm-users', group_id: 'g-management', name: 'Users', icon: Users, url: 'users', sort_order: 1, parent_id: null, visible: true, permission_required: 'manage_users' },
  { id: 'm-roles', group_id: 'g-management', name: 'Roles', icon: Shield, url: 'roles', sort_order: 2, parent_id: null, visible: true, permission_required: 'manage_roles' },
  { id: 'm-departments', group_id: 'g-management', name: 'Departments', icon: Building2, url: 'departments', sort_order: 3, parent_id: null, visible: true, permission_required: 'manage_departments' },
  { id: 'm-storage', group_id: 'g-management', name: 'Storage', icon: HardDrive, url: 'admin', sort_order: 4, parent_id: null, visible: true, permission_required: 'manage_storage' },
  { id: 'm-activity-logs', group_id: 'g-management', name: 'Activity Logs', icon: ScrollText, url: 'activity-logs', sort_order: 5, parent_id: null, visible: true, permission_required: 'view_logs' },
  { id: 'm-reports', group_id: 'g-management', name: 'Reports', icon: BarChart3, url: 'reports', sort_order: 6, parent_id: null, visible: true, permission_required: 'view_reports' },

  // System
  { id: 'm-settings', group_id: 'g-system', name: 'Settings', icon: Settings, url: 'settings', sort_order: 1, parent_id: null, visible: true, permission_required: null, shortcut: 'G S' },
  { id: 'm-monitoring', group_id: 'g-system', name: 'Monitoring', icon: Server, url: 'monitoring', sort_order: 2, parent_id: null, visible: true, permission_required: 'view_monitoring' },
  { id: 'm-backups', group_id: 'g-system', name: 'Backups', icon: Database, url: 'admin', sort_order: 3, parent_id: null, visible: true, permission_required: 'manage_backups' },
  { id: 'm-notifications', group_id: 'g-system', name: 'Notifications', icon: Bell, url: 'notifications', sort_order: 4, parent_id: null, visible: true, permission_required: null, badge_key: 'notifications' },
  { id: 'm-support', group_id: 'g-system', name: 'Support', icon: LifeBuoy, url: 'settings', sort_order: 5, parent_id: null, visible: true, permission_required: null },
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

/** Returns the menu items visible to a given role (permission-based filtering). */
export function getMenuForRole(role: RoleKey): MenuItem[] {
  const perms = rolePermissions[role] || []
  return menuItems.filter(item => {
    if (!item.visible) return false
    if (!item.permission_required) return true
    return perms.includes(item.permission_required)
  })
}

/** Returns the menu items shown in the mobile bottom nav (always 5 — FAB stays center). */
export function getMobileMenu(role: RoleKey): MenuItem[] {
  const visible = getMenuForRole(role)
  const find = (id: string) => visible.find(i => i.id === id)
  return [
    find('m-dashboard') || visible[0],
    find('m-files') || visible[1],
    { id: 'm-fab-upload', group_id: 'g-workspace', name: 'Upload', icon: Upload, url: 'files' as ViewKey, sort_order: 0, parent_id: null, visible: true, permission_required: 'upload' },
    find('m-notifications') || visible.find(i => i.id === 'm-recent') || visible[2],
    find('m-settings') || visible[3],
  ].filter(Boolean) as MenuItem[]
}

// Avoid extra import line — keep Upload at bottom of file for clarity
import { Upload } from 'lucide-react'
