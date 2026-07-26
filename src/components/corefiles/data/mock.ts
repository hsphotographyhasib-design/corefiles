/**
 * CoreFiles — Mock Data Layer
 * Simulates the PostgreSQL / Prisma database for the sandbox preview.
 * In production these tables map 1:1 to Prisma models in /prisma/schema.prisma.
 */

export type ID = string
export type ISODate = string

// ----------------------------- Enums -----------------------------

export type RoleName =
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

export type FileType =
  | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'video'
  | 'audio' | 'text' | 'dwg' | 'folder' | 'archive' | 'code'

export type ServiceStatus = 'online' | 'degraded' | 'offline'

export type LogResult = 'success' | 'failed'

// ----------------------------- Types -----------------------------

export interface User {
  id: ID
  name: string
  email: string
  avatar?: string
  role: RoleName
  departmentId: ID
  status: 'active' | 'suspended' | 'invited'
  twoFactor: boolean
  lastActive: ISODate
  storageUsedBytes: number
  createdAt: ISODate
  jobTitle: string
}

export interface Role {
  id: ID
  name: RoleName
  description: string
  color: string
  permissions: Permission[]
  userCount: number
  isSystem: boolean
}

export interface Department {
  id: ID
  name: string
  parentId: ID | null
  color: string
  icon: string
  headUserId?: ID
  memberCount: number
  storageQuotaBytes: number
  storageUsedBytes: number
}

export interface FolderNode {
  id: ID
  name: string
  parentId: ID | null
  departmentId?: ID
  icon?: string
  createdAt: ISODate
  createdBy: ID
  fileCount: number
  sizeBytes: number
  color?: string
}

export interface FileVersion {
  id: ID
  version: number
  sizeBytes: number
  uploadedAt: ISODate
  uploadedBy: ID
  note?: string
  checksum: string
}

export interface FileItem {
  id: ID
  name: string
  type: FileType
  folderId: ID
  ownerId: ID
  sizeBytes: number
  mimeType: string
  createdAt: ISODate
  updatedAt: ISODate
  starred: boolean
  locked: boolean
  tags: string[]
  versions: FileVersion[]
  sharedWith: ID[]
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  watermark?: boolean
  commentCount: number
  thumbnailColor?: string
  path: string[]
}

export interface ActivityLog {
  id: ID
  timestamp: ISODate
  userId: ID
  action:
    | 'viewed' | 'downloaded' | 'uploaded' | 'deleted' | 'renamed'
    | 'shared' | 'moved' | 'restored' | 'permission_changed'
    | 'locked' | 'unlocked' | 'favorited' | 'commented' | 'version_created'
  fileId?: ID
  fileName?: string
  oldValue?: string
  newValue?: string
  reason?: string
  ip: string
  browser: string
  os: string
}

export interface LoginLog {
  id: ID
  userId: ID
  timestamp: ISODate
  logoutAt?: ISODate
  durationSec: number
  ip: string
  browser: string
  os: string
  device: string
  country: string
  countryFlag: string
  result: LogResult
}

export interface AuditEntry {
  id: ID
  timestamp: ISODate
  actorId: ID
  action: string
  resource: string
  resourceId: ID
  oldValue?: string
  newValue?: string
  reason?: string
  ip: string
  browser: string
}

export interface NotificationItem {
  id: ID
  type:
    | 'file_uploaded' | 'file_shared' | 'permission_changed'
    | 'storage_almost_full' | 'server_offline' | 'login_detected'
    | 'failed_login' | 'approval_request' | 'approval_completed'
    | 'comment_added' | 'version_created'
  title: string
  description: string
  timestamp: ISODate
  read: boolean
  severity: 'info' | 'warning' | 'critical' | 'success'
  actorId?: ID
}

export interface ShareLink {
  id: ID
  fileId: ID
  url: string
  createdBy: ID
  createdAt: ISODate
  expiresAt?: ISODate
  passwordProtected: boolean
  downloads: number
  viewCount: number
  permission: 'view' | 'comment' | 'edit' | 'download'
}

export interface ApiKey {
  id: ID
  name: string
  keyMasked: string
  createdAt: ISODate
  lastUsed?: ISODate
  scopes: string[]
  createdBy: ID
  revoked: boolean
}

export interface ServerService {
  name: string
  status: ServiceStatus
  uptime: string
  version: string
  cpu: number
  ram: number
  disk: number
  description: string
  port: number
}

export interface DashboardMetric {
  label: string
  value: string
  delta: number
  trend: 'up' | 'down' | 'flat'
  series: number[]
  icon: string
  accent: 'green' | 'blue' | 'amber' | 'rose' | 'violet'
}

// ----------------------------- Helpers -----------------------------

const minutesAgo = (m: number): ISODate =>
  new Date(Date.now() - m * 60_000).toISOString()
const hoursAgo = (h: number): ISODate =>
  new Date(Date.now() - h * 3_600_000).toISOString()
const daysAgo = (d: number): ISODate =>
  new Date(Date.now() - d * 86_400_000).toISOString()
const daysAhead = (d: number): ISODate =>
  new Date(Date.now() + d * 86_400_000).toISOString()

const GB = 1024 ** 3
const MB = 1024 ** 2
const KB = 1024

export function fmtBytes(b: number): string {
  if (b >= GB) return `${(b / GB).toFixed(2)} GB`
  if (b >= MB) return `${(b / MB).toFixed(1)} MB`
  if (b >= KB) return `${(b / KB).toFixed(1)} KB`
  return `${b} B`
}

// ----------------------------- Departments -----------------------------

export const departments: Department[] = [
  { id: 'd-admin', name: 'Administration', parentId: null, color: '#10b981', icon: 'building', memberCount: 8, storageQuotaBytes: 200 * GB, storageUsedBytes: 84 * GB },
  { id: 'd-hr', name: 'HR', parentId: null, color: '#0ea5e9', icon: 'users', memberCount: 6, storageQuotaBytes: 100 * GB, storageUsedBytes: 42 * GB },
  { id: 'd-fin', name: 'Finance', parentId: null, color: '#f59e0b', icon: 'wallet', memberCount: 5, storageQuotaBytes: 150 * GB, storageUsedBytes: 67 * GB },
  { id: 'd-elec', name: 'Electrical', parentId: null, color: '#8b5cf6', icon: 'zap', memberCount: 12, storageQuotaBytes: 300 * GB, storageUsedBytes: 178 * GB },
  { id: 'd-mech', name: 'Mechanical', parentId: null, color: '#ef4444', icon: 'cog', memberCount: 9, storageQuotaBytes: 300 * GB, storageUsedBytes: 201 * GB },
  { id: 'd-hvac', name: 'HVAC', parentId: null, color: '#06b6d4', icon: 'wind', memberCount: 4, storageQuotaBytes: 200 * GB, storageUsedBytes: 88 * GB },
  { id: 'd-plum', name: 'Plumbing', parentId: null, color: '#3b82f6', icon: 'droplet', memberCount: 4, storageQuotaBytes: 150 * GB, storageUsedBytes: 51 * GB },
  { id: 'd-civil', name: 'Civil', parentId: null, color: '#a16207', icon: 'hard-hat', memberCount: 7, storageQuotaBytes: 250 * GB, storageUsedBytes: 142 * GB },
  { id: 'd-arch', name: 'Architecture', parentId: null, color: '#ec4899', icon: 'ruler', memberCount: 6, storageQuotaBytes: 250 * GB, storageUsedBytes: 156 * GB },
  { id: 'd-cont', name: 'Contracts', parentId: null, color: '#14b8a6', icon: 'file-text', memberCount: 3, storageQuotaBytes: 100 * GB, storageUsedBytes: 38 * GB },
  { id: 'd-proj', name: 'Projects', parentId: null, color: '#6366f1', icon: 'briefcase', memberCount: 14, storageQuotaBytes: 500 * GB, storageUsedBytes: 312 * GB },
  { id: 'd-proc', name: 'Procurement', parentId: null, color: '#f97316', icon: 'shopping-cart', memberCount: 5, storageQuotaBytes: 150 * GB, storageUsedBytes: 71 * GB },
]

// ----------------------------- Users -----------------------------

export const users: User[] = [
  { id: 'u-1', name: 'Hasan Rahman', email: 'hasan@hasanurjaya.com', role: 'Super Admin', departmentId: 'd-admin', status: 'active', twoFactor: true, lastActive: minutesAgo(3), storageUsedBytes: 4.2 * GB, createdAt: daysAgo(540), jobTitle: 'Chief Executive Officer' },
  { id: 'u-2', name: 'Aisyah Putri', email: 'aisyah@hasanurjaya.com', role: 'Admin', departmentId: 'd-admin', status: 'active', twoFactor: true, lastActive: minutesAgo(12), storageUsedBytes: 2.1 * GB, createdAt: daysAgo(420), jobTitle: 'System Administrator' },
  { id: 'u-3', name: 'Daniel Chen', email: 'daniel@hasanurjaya.com', role: 'Manager', departmentId: 'd-proj', status: 'active', twoFactor: true, lastActive: minutesAgo(45), storageUsedBytes: 8.7 * GB, createdAt: daysAgo(310), jobTitle: 'Project Manager' },
  { id: 'u-4', name: 'Siti Nurhaliza', email: 'siti@hasanurjaya.com', role: 'Department Head', departmentId: 'd-elec', status: 'active', twoFactor: false, lastActive: hoursAgo(2), storageUsedBytes: 12.4 * GB, createdAt: daysAgo(280), jobTitle: 'Electrical Engineer Lead' },
  { id: 'u-5', name: 'Lim Wei Jie', email: 'limwj@hasanurjaya.com', role: 'Employee', departmentId: 'd-mech', status: 'active', twoFactor: false, lastActive: hoursAgo(5), storageUsedBytes: 5.6 * GB, createdAt: daysAgo(195), jobTitle: 'Mechanical Engineer' },
  { id: 'u-6', name: 'Priya Devi', email: 'priya@hasanurjaya.com', role: 'Employee', departmentId: 'd-arch', status: 'active', twoFactor: true, lastActive: minutesAgo(28), storageUsedBytes: 9.8 * GB, createdAt: daysAgo(180), jobTitle: 'Architect' },
  { id: 'u-7', name: 'Ahmad Faizal', email: 'faizal@hasanurjaya.com', role: 'Manager', departmentId: 'd-fin', status: 'active', twoFactor: true, lastActive: hoursAgo(1), storageUsedBytes: 3.4 * GB, createdAt: daysAgo(260), jobTitle: 'Finance Manager' },
  { id: 'u-8', name: 'Nurul Ain', email: 'nurul@hasanurjaya.com', role: 'Employee', departmentId: 'd-hr', status: 'active', twoFactor: false, lastActive: hoursAgo(8), storageUsedBytes: 1.9 * GB, createdAt: daysAgo(150), jobTitle: 'HR Executive' },
  { id: 'u-9', name: 'Arjun Patel', email: 'arjun@hasanurjaya.com', role: 'Department Head', departmentId: 'd-civil', status: 'active', twoFactor: true, lastActive: minutesAgo(15), storageUsedBytes: 7.2 * GB, createdAt: daysAgo(220), jobTitle: 'Civil Engineer Lead' },
  { id: 'u-10', name: 'Mei Ling Tan', email: 'meiling@hasanurjaya.com', role: 'Employee', departmentId: 'd-hvac', status: 'active', twoFactor: false, lastActive: hoursAgo(3), storageUsedBytes: 4.1 * GB, createdAt: daysAgo(140), jobTitle: 'HVAC Engineer' },
  { id: 'u-11', name: 'Raj Kumar', email: 'raj@hasanurjaya.com', role: 'Employee', departmentId: 'd-plum', status: 'suspended', twoFactor: false, lastActive: daysAgo(7), storageUsedBytes: 2.7 * GB, createdAt: daysAgo(120), jobTitle: 'Plumbing Engineer' },
  { id: 'u-12', name: 'Farah Aziz', email: 'farah@hasanurjaya.com', role: 'Read Only', departmentId: 'd-cont', status: 'active', twoFactor: false, lastActive: daysAgo(1), storageUsedBytes: 0.8 * GB, createdAt: daysAgo(90), jobTitle: 'Contract Reviewer' },
  { id: 'u-13', name: 'Chris Wong', email: 'chris@hasanurjaya.com', role: 'Employee', departmentId: 'd-proc', status: 'invited', twoFactor: false, lastActive: daysAgo(3), storageUsedBytes: 0, createdAt: daysAgo(5), jobTitle: 'Procurement Officer' },
  { id: 'u-14', name: 'Lila Hassan', email: 'lila@hasanurjaya.com', role: 'Employee', departmentId: 'd-arch', status: 'active', twoFactor: true, lastActive: minutesAgo(8), storageUsedBytes: 6.5 * GB, createdAt: daysAgo(70), jobTitle: 'Junior Architect' },
  { id: 'u-15', name: 'Zhang Wei', email: 'zhangw@hasanurjaya.com', role: 'Guest', departmentId: 'd-proj', status: 'active', twoFactor: false, lastActive: daysAgo(2), storageUsedBytes: 0.3 * GB, createdAt: daysAgo(30), jobTitle: 'External Consultant' },
]

// ----------------------------- Roles -----------------------------

export const allPermissions: { key: Permission; label: string; description: string }[] = [
  { key: 'view', label: 'View', description: 'View files and folders' },
  { key: 'upload', label: 'Upload', description: 'Upload new files' },
  { key: 'download', label: 'Download', description: 'Download files' },
  { key: 'delete', label: 'Delete', description: 'Delete files permanently' },
  { key: 'rename', label: 'Rename', description: 'Rename files & folders' },
  { key: 'move', label: 'Move', description: 'Move files between folders' },
  { key: 'share', label: 'Share', description: 'Create share links' },
  { key: 'print', label: 'Print', description: 'Print documents' },
  { key: 'restore', label: 'Restore', description: 'Restore deleted items' },
  { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, suspend users' },
  { key: 'manage_roles', label: 'Manage Roles', description: 'Edit role permissions' },
  { key: 'manage_departments', label: 'Manage Departments', description: 'Configure org structure' },
  { key: 'manage_storage', label: 'Manage Storage', description: 'Configure quotas & MinIO' },
  { key: 'manage_settings', label: 'Manage Settings', description: 'System-wide settings' },
]

export const roles: Role[] = [
  { id: 'r-1', name: 'Super Admin', description: 'Full unrestricted access to every module and setting', color: '#dc2626', permissions: allPermissions.map(p => p.key), userCount: 1, isSystem: true },
  { id: 'r-2', name: 'Admin', description: 'Manage users, roles, storage, settings but cannot delete super admin', color: '#7c3aed', permissions: ['view','upload','download','delete','rename','move','share','print','restore','manage_users','manage_roles','manage_departments','manage_storage','manage_settings'], userCount: 1, isSystem: true },
  { id: 'r-3', name: 'Manager', description: 'Department oversight, approval workflows, user provisioning', color: '#0ea5e9', permissions: ['view','upload','download','rename','move','share','print','restore','manage_users'], userCount: 2, isSystem: false },
  { id: 'r-4', name: 'Department Head', description: 'Manage own department files and approve team submissions', color: '#10b981', permissions: ['view','upload','download','rename','move','share','print','restore'], userCount: 2, isSystem: false },
  { id: 'r-5', name: 'Employee', description: 'Standard user with file upload/download/share access', color: '#f59e0b', permissions: ['view','upload','download','rename','move','share','print'], userCount: 8, isSystem: false },
  { id: 'r-6', name: 'Read Only', description: 'Can view and download shared files only', color: '#64748b', permissions: ['view','download'], userCount: 1, isSystem: false },
  { id: 'r-7', name: 'Guest', description: 'Limited external access to specific shared folders', color: '#94a3b8', permissions: ['view'], userCount: 1, isSystem: false },
]

// ----------------------------- Folder Tree -----------------------------

export const folders: FolderNode[] = [
  // Company root
  { id: 'f-root', name: 'Hasanur Jaya', parentId: null, icon: 'building', createdAt: daysAgo(540), createdBy: 'u-1', fileCount: 0, sizeBytes: 0, color: '#10b981' },

  // Administration
  { id: 'f-admin', name: 'Administration', parentId: 'f-root', departmentId: 'd-admin', icon: 'building', createdAt: daysAgo(540), createdBy: 'u-1', fileCount: 28, sizeBytes: 84 * GB },
  { id: 'f-admin-policy', name: 'Policies', parentId: 'f-admin', icon: 'file-text', createdAt: daysAgo(510), createdBy: 'u-2', fileCount: 12, sizeBytes: 18 * GB },
  { id: 'f-admin-contracts', name: 'Company Contracts', parentId: 'f-admin', icon: 'file-text', createdAt: daysAgo(480), createdBy: 'u-1', fileCount: 16, sizeBytes: 66 * GB },

  // HR
  { id: 'f-hr', name: 'HR', parentId: 'f-root', departmentId: 'd-hr', icon: 'users', createdAt: daysAgo(510), createdBy: 'u-1', fileCount: 42, sizeBytes: 42 * GB },
  { id: 'f-hr-emp', name: 'Employee Records', parentId: 'f-hr', icon: 'folder', createdAt: daysAgo(500), createdBy: 'u-8', fileCount: 28, sizeBytes: 22 * GB },
  { id: 'f-hr-leave', name: 'Leave Applications', parentId: 'f-hr', icon: 'folder', createdAt: daysAgo(300), createdBy: 'u-8', fileCount: 14, sizeBytes: 20 * GB },

  // Finance
  { id: 'f-fin', name: 'Finance', parentId: 'f-root', departmentId: 'd-fin', icon: 'wallet', createdAt: daysAgo(510), createdBy: 'u-1', fileCount: 56, sizeBytes: 67 * GB },
  { id: 'f-fin-inv', name: 'Invoices', parentId: 'f-fin', icon: 'file-text', createdAt: daysAgo(500), createdBy: 'u-7', fileCount: 38, sizeBytes: 41 * GB },
  { id: 'f-fin-rpt', name: 'Reports', parentId: 'f-fin', icon: 'bar-chart', createdAt: daysAgo(290), createdBy: 'u-7', fileCount: 18, sizeBytes: 26 * GB },

  // Projects
  { id: 'f-proj', name: 'Projects', parentId: 'f-root', departmentId: 'd-proj', icon: 'briefcase', createdAt: daysAgo(450), createdBy: 'u-3', fileCount: 124, sizeBytes: 312 * GB },
  { id: 'f-proj-drawings', name: 'Drawings', parentId: 'f-proj', icon: 'ruler', createdAt: daysAgo(420), createdBy: 'u-3', fileCount: 56, sizeBytes: 184 * GB },
  { id: 'f-proj-tender', name: 'Tender', parentId: 'f-proj', icon: 'file-text', createdAt: daysAgo(380), createdBy: 'u-3', fileCount: 24, sizeBytes: 41 * GB },
  { id: 'f-proj-photos', name: 'Photos', parentId: 'f-proj', icon: 'image', createdAt: daysAgo(310), createdBy: 'u-3', fileCount: 28, sizeBytes: 58 * GB },
  { id: 'f-proj-videos', name: 'Videos', parentId: 'f-proj', icon: 'video', createdAt: daysAgo(220), createdBy: 'u-3', fileCount: 8, sizeBytes: 24 * GB },

  // Electrical
  { id: 'f-elec', name: 'Electrical', parentId: 'f-root', departmentId: 'd-elec', icon: 'zap', createdAt: daysAgo(420), createdBy: 'u-4', fileCount: 88, sizeBytes: 178 * GB },

  // Mechanical
  { id: 'f-mech', name: 'Mechanical', parentId: 'f-root', departmentId: 'd-mech', icon: 'cog', createdAt: daysAgo(400), createdBy: 'u-5', fileCount: 64, sizeBytes: 201 * GB },

  // Civil
  { id: 'f-civil', name: 'Civil', parentId: 'f-root', departmentId: 'd-civil', icon: 'hard-hat', createdAt: daysAgo(390), createdBy: 'u-9', fileCount: 42, sizeBytes: 142 * GB },

  // Archive
  { id: 'f-archive', name: 'Archive', parentId: 'f-root', icon: 'archive', createdAt: daysAgo(540), createdBy: 'u-1', fileCount: 38, sizeBytes: 95 * GB },
  { id: 'f-trash', name: 'Recycle Bin', parentId: 'f-root', icon: 'trash-2', createdAt: daysAgo(540), createdBy: 'u-1', fileCount: 7, sizeBytes: 12 * GB },
]

// ----------------------------- Files -----------------------------

const fileColors = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899']

export const files: FileItem[] = [
  // Policies
  { id: 'fl-1', name: 'ISO 9001 Quality Manual.pdf', type: 'pdf', folderId: 'f-admin-policy', ownerId: 'u-2', sizeBytes: 4.2 * MB, mimeType: 'application/pdf', createdAt: daysAgo(120), updatedAt: daysAgo(8), starred: true, locked: true, tags: ['policy', 'iso', 'quality'], versions: [{ id: 'v1', version: 3, sizeBytes: 4.2 * MB, uploadedAt: daysAgo(8), uploadedBy: 'u-2', note: 'Updated quality policy section 4.2', checksum: 'sha256:a1b2c3' }], sharedWith: ['u-1', 'u-3'], approvalStatus: 'approved', watermark: true, commentCount: 4, thumbnailColor: fileColors[0], path: ['Hasanur Jaya', 'Administration', 'Policies'] },
  { id: 'fl-2', name: 'Company Health & Safety Policy.docx', type: 'word', folderId: 'f-admin-policy', ownerId: 'u-2', sizeBytes: 2.1 * MB, mimeType: 'application/msword', createdAt: daysAgo(95), updatedAt: daysAgo(14), starred: false, locked: false, tags: ['policy', 'safety'], versions: [{ id: 'v2', version: 2, sizeBytes: 2.1 * MB, uploadedAt: daysAgo(14), uploadedBy: 'u-2', checksum: 'sha256:b1c2d3' }], sharedWith: [], commentCount: 2, thumbnailColor: fileColors[1], path: ['Hasanur Jaya', 'Administration', 'Policies'] },
  { id: 'fl-3', name: 'Information Security Policy.pdf', type: 'pdf', folderId: 'f-admin-policy', ownerId: 'u-1', sizeBytes: 3.8 * MB, mimeType: 'application/pdf', createdAt: daysAgo(80), updatedAt: daysAgo(30), starred: true, locked: true, tags: ['policy', 'security'], versions: [{ id: 'v3', version: 1, sizeBytes: 3.8 * MB, uploadedAt: daysAgo(80), uploadedBy: 'u-1', checksum: 'sha256:c1d2e3' }], sharedWith: [], watermark: true, commentCount: 0, thumbnailColor: fileColors[2], path: ['Hasanur Jaya', 'Administration', 'Policies'] },

  // Employee Records
  { id: 'fl-4', name: 'Employee Master List 2026.xlsx', type: 'excel', folderId: 'f-hr-emp', ownerId: 'u-8', sizeBytes: 1.4 * MB, mimeType: 'application/vnd.ms-excel', createdAt: daysAgo(45), updatedAt: daysAgo(2), starred: false, locked: false, tags: ['hr', 'roster'], versions: [{ id: 'v4', version: 12, sizeBytes: 1.4 * MB, uploadedAt: daysAgo(2), uploadedBy: 'u-8', checksum: 'sha256:d2e3f4' }], sharedWith: ['u-1', 'u-7'], commentCount: 6, thumbnailColor: fileColors[3], path: ['Hasanur Jaya', 'HR', 'Employee Records'] },
  { id: 'fl-5', name: 'Onboarding Checklist.pdf', type: 'pdf', folderId: 'f-hr-emp', ownerId: 'u-8', sizeBytes: 0.8 * MB, mimeType: 'application/pdf', createdAt: daysAgo(120), updatedAt: daysAgo(60), starred: false, locked: false, tags: ['hr', 'onboarding'], versions: [{ id: 'v5', version: 4, sizeBytes: 0.8 * MB, uploadedAt: daysAgo(60), uploadedBy: 'u-8', checksum: 'sha256:e3f4a5' }], sharedWith: [], commentCount: 1, thumbnailColor: fileColors[4], path: ['Hasanur Jaya', 'HR', 'Employee Records'] },

  // Invoices
  { id: 'fl-6', name: 'Invoice 2026-Q1 Summary.xlsx', type: 'excel', folderId: 'f-fin-inv', ownerId: 'u-7', sizeBytes: 2.3 * MB, mimeType: 'application/vnd.ms-excel', createdAt: daysAgo(28), updatedAt: daysAgo(3), starred: true, locked: false, tags: ['finance', 'invoice', 'quarterly'], versions: [{ id: 'v6', version: 5, sizeBytes: 2.3 * MB, uploadedAt: daysAgo(3), uploadedBy: 'u-7', checksum: 'sha256:f4a5b6' }], sharedWith: ['u-1', 'u-3'], commentCount: 3, thumbnailColor: fileColors[5], path: ['Hasanur Jaya', 'Finance', 'Invoices'] },
  { id: 'fl-7', name: 'Vendor Payment Schedule.pdf', type: 'pdf', folderId: 'f-fin-inv', ownerId: 'u-7', sizeBytes: 1.6 * MB, mimeType: 'application/pdf', createdAt: daysAgo(35), updatedAt: daysAgo(35), starred: false, locked: false, tags: ['finance', 'payment'], versions: [{ id: 'v7', version: 1, sizeBytes: 1.6 * MB, uploadedAt: daysAgo(35), uploadedBy: 'u-7', checksum: 'sha256:a5b6c7' }], sharedWith: [], commentCount: 0, thumbnailColor: fileColors[6], path: ['Hasanur Jaya', 'Finance', 'Invoices'] },

  // Drawings
  { id: 'fl-8', name: 'Tower A — Electrical Layout.dwg', type: 'dwg', folderId: 'f-proj-drawings', ownerId: 'u-4', sizeBytes: 18.4 * MB, mimeType: 'application/acad', createdAt: daysAgo(60), updatedAt: daysAgo(4), starred: true, locked: true, tags: ['drawing', 'electrical', 'tower-a'], versions: [{ id: 'v8', version: 7, sizeBytes: 18.4 * MB, uploadedAt: daysAgo(4), uploadedBy: 'u-4', note: 'Revised circuit routing on L12', checksum: 'sha256:b6c7d8' }], sharedWith: ['u-3', 'u-9', 'u-6'], approvalStatus: 'approved', watermark: true, commentCount: 12, thumbnailColor: fileColors[0], path: ['Hasanur Jaya', 'Projects', 'Drawings'] },
  { id: 'fl-9', name: 'Tower A — Floor Plan L12.dwg', type: 'dwg', folderId: 'f-proj-drawings', ownerId: 'u-6', sizeBytes: 22.1 * MB, mimeType: 'application/acad', createdAt: daysAgo(50), updatedAt: daysAgo(12), starred: false, locked: false, tags: ['drawing', 'architecture', 'tower-a'], versions: [{ id: 'v9', version: 4, sizeBytes: 22.1 * MB, uploadedAt: daysAgo(12), uploadedBy: 'u-6', checksum: 'sha256:c7d8e9' }], sharedWith: ['u-3', 'u-9'], approvalStatus: 'pending', commentCount: 8, thumbnailColor: fileColors[1], path: ['Hasanur Jaya', 'Projects', 'Drawings'] },
  { id: 'fl-10', name: 'Site Master Plan.pdf', type: 'pdf', folderId: 'f-proj-drawings', ownerId: 'u-9', sizeBytes: 12.6 * MB, mimeType: 'application/pdf', createdAt: daysAgo(90), updatedAt: daysAgo(20), starred: true, locked: false, tags: ['drawing', 'civil', 'masterplan'], versions: [{ id: 'v10', version: 3, sizeBytes: 12.6 * MB, uploadedAt: daysAgo(20), uploadedBy: 'u-9', checksum: 'sha256:d8e9f0' }], sharedWith: ['u-1', 'u-3', 'u-4', 'u-6'], commentCount: 5, thumbnailColor: fileColors[2], path: ['Hasanur Jaya', 'Projects', 'Drawings'] },

  // Tender
  { id: 'fl-11', name: 'Tender Document — KL Tower Phase 2.pdf', type: 'pdf', folderId: 'f-proj-tender', ownerId: 'u-3', sizeBytes: 8.4 * MB, mimeType: 'application/pdf', createdAt: daysAgo(25), updatedAt: daysAgo(2), starred: true, locked: true, tags: ['tender', 'kl-tower', 'phase-2'], versions: [{ id: 'v11', version: 6, sizeBytes: 8.4 * MB, uploadedAt: daysAgo(2), uploadedBy: 'u-3', checksum: 'sha256:e9f0a1' }], sharedWith: ['u-1', 'u-7'], approvalStatus: 'approved', watermark: true, commentCount: 15, thumbnailColor: fileColors[3], path: ['Hasanur Jaya', 'Projects', 'Tender'] },
  { id: 'fl-12', name: 'Bill of Quantities.xlsx', type: 'excel', folderId: 'f-proj-tender', ownerId: 'u-3', sizeBytes: 3.2 * MB, mimeType: 'application/vnd.ms-excel', createdAt: daysAgo(22), updatedAt: daysAgo(5), starred: false, locked: false, tags: ['tender', 'boq'], versions: [{ id: 'v12', version: 9, sizeBytes: 3.2 * MB, uploadedAt: daysAgo(5), uploadedBy: 'u-3', checksum: 'sha256:f0a1b2' }], sharedWith: ['u-7'], commentCount: 4, thumbnailColor: fileColors[4], path: ['Hasanur Jaya', 'Projects', 'Tender'] },

  // Photos
  { id: 'fl-13', name: 'Site Survey — Tower A Foundation.jpg', type: 'image', folderId: 'f-proj-photos', ownerId: 'u-9', sizeBytes: 6.8 * MB, mimeType: 'image/jpeg', createdAt: daysAgo(45), updatedAt: daysAgo(45), starred: false, locked: false, tags: ['photo', 'site-survey'], versions: [{ id: 'v13', version: 1, sizeBytes: 6.8 * MB, uploadedAt: daysAgo(45), uploadedBy: 'u-9', checksum: 'sha256:a1b2c3' }], sharedWith: [], commentCount: 1, thumbnailColor: fileColors[5], path: ['Hasanur Jaya', 'Projects', 'Photos'] },
  { id: 'fl-14', name: 'Progress Photo Week 28.png', type: 'image', folderId: 'f-proj-photos', ownerId: 'u-3', sizeBytes: 4.4 * MB, mimeType: 'image/png', createdAt: daysAgo(7), updatedAt: daysAgo(7), starred: true, locked: false, tags: ['photo', 'progress'], versions: [{ id: 'v14', version: 1, sizeBytes: 4.4 * MB, uploadedAt: daysAgo(7), uploadedBy: 'u-3', checksum: 'sha256:b2c3d4' }], sharedWith: ['u-1'], commentCount: 2, thumbnailColor: fileColors[6], path: ['Hasanur Jaya', 'Projects', 'Photos'] },

  // Videos
  { id: 'fl-15', name: 'Drone Survey — Full Site.mp4', type: 'video', folderId: 'f-proj-videos', ownerId: 'u-3', sizeBytes: 184 * MB, mimeType: 'video/mp4', createdAt: daysAgo(14), updatedAt: daysAgo(14), starred: true, locked: false, tags: ['video', 'drone', 'survey'], versions: [{ id: 'v15', version: 2, sizeBytes: 184 * MB, uploadedAt: daysAgo(14), uploadedBy: 'u-3', checksum: 'sha256:c3d4e5' }], sharedWith: ['u-1', 'u-4'], commentCount: 3, thumbnailColor: fileColors[0], path: ['Hasanur Jaya', 'Projects', 'Videos'] },

  // Electrical dept files
  { id: 'fl-16', name: 'Load Calculation Spreadsheet.xlsx', type: 'excel', folderId: 'f-elec', ownerId: 'u-4', sizeBytes: 1.1 * MB, mimeType: 'application/vnd.ms-excel', createdAt: daysAgo(18), updatedAt: daysAgo(3), starred: false, locked: false, tags: ['electrical', 'calc'], versions: [{ id: 'v16', version: 4, sizeBytes: 1.1 * MB, uploadedAt: daysAgo(3), uploadedBy: 'u-4', checksum: 'sha256:d4e5f6' }], sharedWith: [], commentCount: 0, thumbnailColor: fileColors[1], path: ['Hasanur Jaya', 'Electrical'] },
  { id: 'fl-17', name: 'Single Line Diagram.pdf', type: 'pdf', folderId: 'f-elec', ownerId: 'u-4', sizeBytes: 5.4 * MB, mimeType: 'application/pdf', createdAt: daysAgo(30), updatedAt: daysAgo(30), starred: true, locked: false, tags: ['electrical', 'diagram'], versions: [{ id: 'v17', version: 2, sizeBytes: 5.4 * MB, uploadedAt: daysAgo(30), uploadedBy: 'u-4', checksum: 'sha256:e5f6a7' }], sharedWith: ['u-3'], commentCount: 2, thumbnailColor: fileColors[2], path: ['Hasanur Jaya', 'Electrical'] },

  // Mechanical dept files
  { id: 'fl-18', name: 'HVAC Specification.docx', type: 'word', folderId: 'f-mech', ownerId: 'u-5', sizeBytes: 2.8 * MB, mimeType: 'application/msword', createdAt: daysAgo(40), updatedAt: daysAgo(10), starred: false, locked: false, tags: ['mechanical', 'hvac', 'spec'], versions: [{ id: 'v18', version: 3, sizeBytes: 2.8 * MB, uploadedAt: daysAgo(10), uploadedBy: 'u-5', checksum: 'sha256:f6a7b8' }], sharedWith: ['u-10'], commentCount: 1, thumbnailColor: fileColors[3], path: ['Hasanur Jaya', 'Mechanical'] },
  { id: 'fl-19', name: 'Chiller Schedule.pdf', type: 'pdf', folderId: 'f-mech', ownerId: 'u-5', sizeBytes: 3.2 * MB, mimeType: 'application/pdf', createdAt: daysAgo(55), updatedAt: daysAgo(15), starred: false, locked: false, tags: ['mechanical', 'chiller'], versions: [{ id: 'v19', version: 2, sizeBytes: 3.2 * MB, uploadedAt: daysAgo(15), uploadedBy: 'u-5', checksum: 'sha256:a7b8c9' }], sharedWith: [], commentCount: 0, thumbnailColor: fileColors[4], path: ['Hasanur Jaya', 'Mechanical'] },

  // Civil
  { id: 'fl-20', name: 'Foundation Design Report.pdf', type: 'pdf', folderId: 'f-civil', ownerId: 'u-9', sizeBytes: 8.9 * MB, mimeType: 'application/pdf', createdAt: daysAgo(35), updatedAt: daysAgo(8), starred: true, locked: false, tags: ['civil', 'foundation', 'report'], versions: [{ id: 'v20', version: 5, sizeBytes: 8.9 * MB, uploadedAt: daysAgo(8), uploadedBy: 'u-9', checksum: 'sha256:b8c9d0' }], sharedWith: ['u-1', 'u-3'], approvalStatus: 'approved', commentCount: 7, thumbnailColor: fileColors[5], path: ['Hasanur Jaya', 'Civil'] },

  // Recycle bin
  { id: 'fl-t1', name: 'Old Proposal Draft.docx', type: 'word', folderId: 'f-trash', ownerId: 'u-3', sizeBytes: 1.4 * MB, mimeType: 'application/msword', createdAt: daysAgo(90), updatedAt: daysAgo(20), starred: false, locked: false, tags: ['proposal', 'draft'], versions: [{ id: 'v21', version: 1, sizeBytes: 1.4 * MB, uploadedAt: daysAgo(90), uploadedBy: 'u-3', checksum: 'sha256:c9d0e1' }], sharedWith: [], commentCount: 0, thumbnailColor: fileColors[6], path: ['Hasanur Jaya', 'Recycle Bin'] },
]

// ----------------------------- Activity Logs -----------------------------

export const activityLogs: ActivityLog[] = [
  { id: 'al-1', timestamp: minutesAgo(2), userId: 'u-1', action: 'viewed', fileId: 'fl-8', fileName: 'Tower A — Electrical Layout.dwg', ip: '203.106.84.12', browser: 'Chrome 138', os: 'macOS' },
  { id: 'al-2', timestamp: minutesAgo(8), userId: 'u-3', action: 'uploaded', fileId: 'fl-14', fileName: 'Progress Photo Week 28.png', ip: '175.136.45.8', browser: 'Chrome 138', os: 'Windows 11' },
  { id: 'al-3', timestamp: minutesAgo(15), userId: 'u-9', action: 'renamed', fileId: 'fl-20', fileName: 'Foundation Design Report.pdf', oldValue: 'Foundation Report v4.pdf', newValue: 'Foundation Design Report.pdf', ip: '203.106.84.12', browser: 'Chrome 138', os: 'Linux' },
  { id: 'al-4', timestamp: minutesAgo(28), userId: 'u-4', action: 'shared', fileId: 'fl-8', fileName: 'Tower A — Electrical Layout.dwg', newValue: 'Arjun Patel, Daniel Chen', ip: '183.171.221.55', browser: 'Edge 138', os: 'Windows 11' },
  { id: 'al-5', timestamp: minutesAgo(45), userId: 'u-7', action: 'downloaded', fileId: 'fl-6', fileName: 'Invoice 2026-Q1 Summary.xlsx', ip: '175.136.45.8', browser: 'Chrome 138', os: 'macOS' },
  { id: 'al-6', timestamp: hoursAgo(2), userId: 'u-2', action: 'permission_changed', fileId: 'fl-3', fileName: 'Information Security Policy.pdf', oldValue: 'View only', newValue: 'View + Download', reason: 'Department heads need offline access', ip: '203.106.84.12', browser: 'Chrome 138', os: 'Windows 11' },
  { id: 'al-7', timestamp: hoursAgo(3), userId: 'u-3', action: 'version_created', fileId: 'fl-11', fileName: 'Tender Document — KL Tower Phase 2.pdf', newValue: 'v6', ip: '175.136.45.8', browser: 'Chrome 138', os: 'Windows 11' },
  { id: 'al-8', timestamp: hoursAgo(5), userId: 'u-5', action: 'locked', fileId: 'fl-18', fileName: 'HVAC Specification.docx', newValue: 'Locked by Lim Wei Jie', ip: '183.171.221.55', browser: 'Firefox 138', os: 'Windows 11' },
  { id: 'al-9', timestamp: hoursAgo(8), userId: 'u-8', action: 'commented', fileId: 'fl-4', fileName: 'Employee Master List 2026.xlsx', newValue: '"Please verify row 47 — joining date looks off"', ip: '203.106.84.12', browser: 'Chrome 138', os: 'macOS' },
  { id: 'al-10', timestamp: hoursAgo(12), userId: 'u-6', action: 'moved', fileId: 'fl-9', fileName: 'Tower A — Floor Plan L12.dwg', oldValue: '/Projects/Drafts', newValue: '/Projects/Drawings', ip: '175.136.45.8', browser: 'Safari 18', os: 'macOS' },
  { id: 'al-11', timestamp: daysAgo(1), userId: 'u-1', action: 'restored', fileId: 'fl-20', fileName: 'Foundation Design Report.pdf', oldValue: 'Recycle Bin', newValue: '/Civil', ip: '203.106.84.12', browser: 'Chrome 138', os: 'macOS' },
  { id: 'al-12', timestamp: daysAgo(2), userId: 'u-3', action: 'favorited', fileId: 'fl-15', fileName: 'Drone Survey — Full Site.mp4', ip: '175.136.45.8', browser: 'Chrome 138', os: 'Windows 11' },
  { id: 'al-13', timestamp: daysAgo(3), userId: 'u-4', action: 'deleted', fileId: 'fl-t1', fileName: 'Old Proposal Draft.docx', reason: 'Replaced by final tender document', ip: '183.171.221.55', browser: 'Edge 138', os: 'Windows 11' },
  { id: 'al-14', timestamp: daysAgo(4), userId: 'u-9', action: 'uploaded', fileId: 'fl-20', fileName: 'Foundation Design Report.pdf', newValue: 'v5', ip: '203.106.84.12', browser: 'Chrome 138', os: 'Linux' },
]

// ----------------------------- Login Logs -----------------------------

export const loginLogs: LoginLog[] = [
  { id: 'll-1', userId: 'u-1', timestamp: minutesAgo(3), durationSec: 0, ip: '203.106.84.12', browser: 'Chrome 138', os: 'macOS', device: 'MacBook Pro 16"', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-2', userId: 'u-3', timestamp: minutesAgo(45), durationSec: 0, ip: '175.136.45.8', browser: 'Chrome 138', os: 'Windows 11', device: 'Dell XPS 15', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-3', userId: 'u-9', timestamp: minutesAgo(15), durationSec: 0, ip: '203.106.84.12', browser: 'Chrome 138', os: 'Linux', device: 'ThinkPad T14', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-4', userId: 'u-14', timestamp: minutesAgo(8), durationSec: 0, ip: '118.101.222.7', browser: 'Safari 18', os: 'iOS 18', device: 'iPhone 15 Pro', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-5', userId: 'u-7', timestamp: hoursAgo(1), logoutAt: minutesAgo(20), durationSec: 2460, ip: '175.136.45.8', browser: 'Chrome 138', os: 'macOS', device: 'MacBook Air M2', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-6', userId: 'u-15', timestamp: hoursAgo(4), logoutAt: hoursAgo(2), durationSec: 7200, ip: '34.124.200.55', browser: 'Chrome 138', os: 'Android 14', device: 'Samsung S24', country: 'Singapore', countryFlag: '🇸🇬', result: 'success' },
  { id: 'll-7', userId: 'u-4', timestamp: hoursAgo(2), durationSec: 0, ip: '183.171.221.55', browser: 'Edge 138', os: 'Windows 11', device: 'Surface Laptop 5', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-8', userId: 'u-1', timestamp: hoursAgo(6), logoutAt: hoursAgo(5), durationSec: 3600, ip: '203.106.84.12', browser: 'Chrome 138', os: 'macOS', device: 'MacBook Pro 16"', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-9', userId: 'unknown', timestamp: hoursAgo(8), durationSec: 0, ip: '91.243.59.12', browser: 'Unknown', os: 'Unknown', device: 'Unknown', country: 'Russia', countryFlag: '🇷🇺', result: 'failed' },
  { id: 'll-10', userId: 'u-2', timestamp: hoursAgo(10), logoutAt: hoursAgo(4), durationSec: 21600, ip: '203.106.84.12', browser: 'Chrome 138', os: 'Windows 11', device: 'Dell OptiPlex', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
  { id: 'll-11', userId: 'unknown', timestamp: daysAgo(1), durationSec: 0, ip: '45.227.255.206', browser: 'Unknown', os: 'Unknown', device: 'Unknown', country: 'Brazil', countryFlag: '🇧🇷', result: 'failed' },
  { id: 'll-12', userId: 'u-5', timestamp: daysAgo(1), logoutAt: hoursAgo(20), durationSec: 14400, ip: '183.171.221.55', browser: 'Firefox 138', os: 'Windows 11', device: 'ASUS ROG', country: 'Malaysia', countryFlag: '🇲🇾', result: 'success' },
]

// ----------------------------- Audit Logs -----------------------------

export const auditLogs: AuditEntry[] = [
  { id: 'au-1', timestamp: minutesAgo(5), actorId: 'u-2', action: 'role.permission.update', resource: 'Role', resourceId: 'r-5', oldValue: 'Employee: [view, upload, download]', newValue: 'Employee: [view, upload, download, share]', reason: 'Quarterly permission review', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-2', timestamp: minutesAgo(20), actorId: 'u-1', action: 'user.suspend', resource: 'User', resourceId: 'u-11', oldValue: 'active', newValue: 'suspended', reason: 'Failed login attempts exceeded threshold', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-3', timestamp: hoursAgo(1), actorId: 'u-2', action: 'storage.quota.update', resource: 'Department', resourceId: 'd-proj', oldValue: '400 GB', newValue: '500 GB', reason: 'Project volume growth', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-4', timestamp: hoursAgo(3), actorId: 'u-3', action: 'file.approve', resource: 'File', resourceId: 'fl-11', oldValue: 'pending', newValue: 'approved', reason: 'Tender document verified by PM', ip: '175.136.45.8', browser: 'Chrome 138' },
  { id: 'au-5', timestamp: hoursAgo(6), actorId: 'u-1', action: 'system.backup.create', resource: 'System', resourceId: 'sys', oldValue: '', newValue: 'backup-2026-07-25-03:00.tar.gz', reason: 'Scheduled daily backup', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-6', timestamp: hoursAgo(12), actorId: 'u-2', action: 'apikey.create', resource: 'ApiKey', resourceId: 'ak-2', oldValue: '', newValue: 'CI/CD Upload Bot', reason: 'Automated deployment pipeline', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-7', timestamp: daysAgo(1), actorId: 'u-1', action: 'department.create', resource: 'Department', resourceId: 'd-plum', oldValue: '', newValue: 'Plumbing', reason: 'Org restructuring Q3 2026', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-8', timestamp: daysAgo(2), actorId: 'u-2', action: 'user.invite', resource: 'User', resourceId: 'u-13', oldValue: '', newValue: 'Chris Wong (chris@hasanurjaya.com)', reason: 'New procurement hire', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-9', timestamp: daysAgo(3), actorId: 'u-1', action: 'system.settings.update', resource: 'Settings', resourceId: 'sys', oldValue: 'session_timeout: 60min', newValue: 'session_timeout: 30min', reason: 'Tighten security policy', ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'au-10', timestamp: daysAgo(5), actorId: 'u-2', action: 'apikey.revoke', resource: 'ApiKey', resourceId: 'ak-1', oldValue: 'active', newValue: 'revoked', reason: 'Key rotation policy', ip: '203.106.84.12', browser: 'Chrome 138' },
]

// ----------------------------- Notifications -----------------------------

export const notifications: NotificationItem[] = [
  { id: 'n-1', type: 'approval_request', title: 'Approval required: Tower A — Floor Plan L12.dwg', description: 'Priya Devi submitted v4 for review', timestamp: minutesAgo(5), read: false, severity: 'warning', actorId: 'u-6' },
  { id: 'n-2', type: 'file_shared', title: 'Tower A — Electrical Layout.dwg shared with you', description: 'Siti Nurhaliza granted view access', timestamp: minutesAgo(28), read: false, severity: 'info', actorId: 'u-4' },
  { id: 'n-3', type: 'failed_login', title: 'Failed login attempt blocked', description: 'From Russia (91.243.59.12) — 3rd attempt', timestamp: hoursAgo(8), read: false, severity: 'critical' },
  { id: 'n-4', type: 'storage_almost_full', title: 'Projects department at 62% of quota', description: '312 GB used of 500 GB quota', timestamp: hoursAgo(2), read: true, severity: 'warning' },
  { id: 'n-5', type: 'login_detected', title: 'New device login', description: 'iPhone 15 Pro from Malaysia (118.101.222.7)', timestamp: minutesAgo(8), read: false, severity: 'info', actorId: 'u-14' },
  { id: 'n-6', type: 'file_uploaded', title: 'New upload in /Projects/Photos', description: 'Daniel Chen uploaded Progress Photo Week 28.png', timestamp: minutesAgo(8), read: true, severity: 'success', actorId: 'u-3' },
  { id: 'n-7', type: 'approval_completed', title: 'Tender Document — KL Tower Phase 2.pdf approved', description: 'You approved this document 3h ago', timestamp: hoursAgo(3), read: true, severity: 'success', actorId: 'u-3' },
  { id: 'n-8', type: 'permission_changed', title: 'Permission updated on Information Security Policy.pdf', description: 'View only → View + Download', timestamp: hoursAgo(2), read: true, severity: 'info', actorId: 'u-2' },
  { id: 'n-9', type: 'comment_added', title: 'Nurul Ain commented on Employee Master List', description: '"Please verify row 47 — joining date looks off"', timestamp: hoursAgo(8), read: true, severity: 'info', actorId: 'u-8' },
  { id: 'n-10', type: 'version_created', title: 'New version: Foundation Design Report v5', description: 'Arjun Patel uploaded a new revision', timestamp: daysAgo(4), read: true, severity: 'info', actorId: 'u-9' },
]

// ----------------------------- API Keys -----------------------------

export const apiKeys: ApiKey[] = [
  { id: 'ak-1', name: 'CI/CD Upload Bot', keyMasked: 'cf_live_••••••••3a82', createdAt: daysAgo(45), lastUsed: hoursAgo(2), scopes: ['files:write', 'folders:read'], createdBy: 'u-2', revoked: false },
  { id: 'ak-2', name: 'Reporting Service', keyMasked: 'cf_live_••••••••9f17', createdAt: daysAgo(120), lastUsed: hoursAgo(1), scopes: ['files:read', 'reports:read'], createdBy: 'u-1', revoked: false },
  { id: 'ak-3', name: 'Mobile App Sync', keyMasked: 'cf_live_••••••••c4d1', createdAt: daysAgo(60), lastUsed: minutesAgo(15), scopes: ['files:read', 'files:write', 'auth:read'], createdBy: 'u-1', revoked: false },
  { id: 'ak-4', name: 'Legacy Webhook (revoked)', keyMasked: 'cf_live_••••••••0ba8', createdAt: daysAgo(180), lastUsed: daysAgo(5), scopes: ['files:read'], createdBy: 'u-2', revoked: true },
]

// ----------------------------- Server Services -----------------------------

export const serverServices: ServerService[] = [
  { name: 'CoreFiles API', status: 'online', uptime: '42d 18h', version: 'v2.4.1', cpu: 12, ram: 38, disk: 47, description: 'NestJS REST API (port 4000)', port: 4000 },
  { name: 'PostgreSQL', status: 'online', uptime: '42d 18h', version: '16.3', cpu: 8, ram: 52, disk: 47, description: 'Primary database (port 5432)', port: 5432 },
  { name: 'Redis', status: 'online', uptime: '42d 18h', version: '7.4.1', cpu: 2, ram: 18, disk: 12, description: 'Cache & BullMQ queue (port 6379)', port: 6379 },
  { name: 'MinIO', status: 'online', uptime: '42d 18h', version: 'RELEASE.2026-07', cpu: 6, ram: 28, disk: 62, description: 'S3 object storage (port 9000)', port: 9000 },
  { name: 'Nginx', status: 'online', uptime: '42d 18h', version: '1.27.1', cpu: 4, ram: 12, disk: 8, description: 'Reverse proxy + TLS (port 443)', port: 443 },
  { name: 'ClamAV', status: 'online', uptime: '42d 18h', version: '1.4.0', cpu: 1, ram: 22, disk: 18, description: 'Virus scanner (port 3310)', port: 3310 },
  { name: 'Prometheus', status: 'online', uptime: '42d 18h', version: '2.55', cpu: 3, ram: 24, disk: 28, description: 'Metrics (port 9090)', port: 9090 },
  { name: 'Grafana', status: 'online', uptime: '42d 18h', version: '11.4.0', cpu: 2, ram: 16, disk: 14, description: 'Dashboards (port 3001)', port: 3001 },
  { name: 'Watchtower', status: 'online', uptime: '42d 18h', version: '1.7', cpu: 0.5, ram: 4, disk: 2, description: 'Auto-update containers', port: 0 },
  { name: 'Uptime Kuma', status: 'degraded', uptime: '12d 4h', version: '1.23', cpu: 1, ram: 8, disk: 5, description: 'External monitoring (port 3002)', port: 3002 },
]

// ----------------------------- Dashboard Series -----------------------------

export const networkInSeries = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, '0')}:00`,
  inbound: Math.round(20 + 40 * Math.sin(i / 3) + Math.random() * 30),
  outbound: Math.round(10 + 25 * Math.cos(i / 4) + Math.random() * 20),
}))

export const uploadDownloadTrend = Array.from({ length: 14 }, (_, i) => {
  const d = daysAgo(13 - i).slice(0, 10)
  return {
    date: d,
    uploads: Math.round(8 + Math.random() * 35),
    downloads: Math.round(15 + Math.random() * 45),
  }
})

export const storageByDept = departments.map(d => ({
  name: d.name,
  used: +(d.storageUsedBytes / GB).toFixed(1),
  quota: +(d.storageQuotaBytes / GB).toFixed(0),
  color: d.color,
}))

// ----------------------------- Lookup helpers -----------------------------

export const userById = (id: ID): User | undefined => users.find(u => u.id === id)
export const deptById = (id: ID): Department | undefined => departments.find(d => d.id === id)
export const folderById = (id: ID): FolderNode | undefined => folders.find(f => f.id === id)
export const fileById = (id: ID): FileItem | undefined => files.find(f => f.id === id)

export const initials = (name: string): string =>
  name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

export const totalStorageUsed = (): number =>
  departments.reduce((s, d) => s + d.storageUsedBytes, 0)
export const totalStorageQuota = (): number =>
  departments.reduce((s, d) => s + d.storageQuotaBytes, 0)

export const todayUploads = (): number => 47
export const todayDownloads = (): number => 128
export const activeUsersToday = (): number =>
  users.filter(u => {
    const last = new Date(u.lastActive).getTime()
    return Date.now() - last < 24 * 3600_000
  }).length

export const recentActivities = activityLogs.slice(0, 8)

// ----------------------------- File type icon & color mapping -----------------------------

export const fileTypeMeta: Record<FileType, { color: string; bg: string; label: string; icon: string }> = {
  pdf:        { color: '#dc2626', bg: 'rgba(220,38,38,0.10)', label: 'PDF',          icon: 'file-text' },
  word:       { color: '#2563eb', bg: 'rgba(37,99,235,0.10)',  label: 'Word',         icon: 'file-text' },
  excel:      { color: '#16a34a', bg: 'rgba(22,163,74,0.10)',  label: 'Excel',        icon: 'file-spreadsheet' },
  powerpoint: { color: '#ea580c', bg: 'rgba(234,88,12,0.10)',  label: 'PowerPoint',  icon: 'presentation' },
  image:      { color: '#7c3aed', bg: 'rgba(124,58,237,0.10)', label: 'Image',        icon: 'image' },
  video:      { color: '#db2777', bg: 'rgba(219,39,119,0.10)', label: 'Video',        icon: 'film' },
  audio:      { color: '#0891b2', bg: 'rgba(8,145,178,0.10)',  label: 'Audio',        icon: 'music' },
  text:       { color: '#475569', bg: 'rgba(71,85,105,0.10)',  label: 'Text',         icon: 'file-text' },
  dwg:        { color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)', label: 'DWG',          icon: 'ruler' },
  folder:     { color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'Folder',       icon: 'folder' },
  archive:    { color: '#a16207', bg: 'rgba(161,98,7,0.10)',   label: 'Archive',      icon: 'archive' },
  code:       { color: '#9333ea', bg: 'rgba(147,51,234,0.10)', label: 'Code',         icon: 'code' },
}
