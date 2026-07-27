/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Shield, Bell, Clock, Activity, Camera, Upload, Trash2,
  Check, X, Save, AlertTriangle, Loader2, Monitor, Smartphone, Tablet,
  LogOut, Globe, MapPin, Building2, Briefcase, Calendar, Languages, Moon,
  Sun, Settings2, Eye, EyeOff, Key, RefreshCw, ChevronRight, Lock, Wifi,
} from 'lucide-react'
import { useApp, type UserProfile } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { ImageCropper } from '@/components/corefiles/profile/image-cropper'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { departments } from '@/components/corefiles/data/mock'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format } from 'date-fns'

type Tab = 'general' | 'contact' | 'security' | 'preferences' | 'sessions' | 'notifications' | 'activity'

const tabs: { key: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: 'general', label: 'General', icon: User },
  { key: 'contact', label: 'Contact', icon: Mail },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'preferences', label: 'Preferences', icon: Settings2 },
  { key: 'sessions', label: 'Sessions', icon: Monitor },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'activity', label: 'Activity', icon: Activity },
]

// Mock sessions (in production: GET /api/v1/profile/sessions)
const mockSessions = [
  { id: 'sess_1', isCurrent: true, device: 'MacBook Pro 16"', browser: 'Chrome 138', os: 'macOS 14.5', ipAddress: '203.106.84.12', country: 'Malaysia', countryFlag: '🇲🇾', city: 'Kuala Lumpur', loginAt: new Date(Date.now() - 2 * 3600_000).toISOString(), lastActiveAt: new Date().toISOString() },
  { id: 'sess_2', isCurrent: false, device: 'iPhone 15 Pro', browser: 'Safari 18', os: 'iOS 18.1', ipAddress: '118.101.222.7', country: 'Malaysia', countryFlag: '🇲🇾', city: 'Kuala Lumpur', loginAt: new Date(Date.now() - 8 * 3600_000).toISOString(), lastActiveAt: new Date(Date.now() - 30 * 60_000).toISOString() },
  { id: 'sess_3', isCurrent: false, device: 'Dell OptiPlex', browser: 'Edge 138', os: 'Windows 11', ipAddress: '175.136.45.8', country: 'Singapore', countryFlag: '🇸🇬', city: 'Singapore', loginAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString(), lastActiveAt: new Date(Date.now() - 5 * 3600_000).toISOString() },
]

// Mock activity feed
const mockActivity = [
  { id: 'a1', action: 'Profile updated', timestamp: new Date(Date.now() - 5 * 60_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'a2', action: 'Avatar uploaded', timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'a3', action: 'Login from MacBook Pro', timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'a4', action: 'Password changed', timestamp: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'a5', action: 'Two-factor authentication enabled', timestamp: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
  { id: 'a6', action: 'Login from iPhone 15 Pro', timestamp: new Date(Date.now() - 8 * 3600_000).toISOString(), ip: '118.101.222.7', browser: 'Safari 18' },
  { id: 'a7', action: 'Failed login attempt blocked', timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(), ip: '91.243.59.12', browser: 'Unknown' },
  { id: 'a8', action: 'Notification settings changed', timestamp: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(), ip: '203.106.84.12', browser: 'Chrome 138' },
]

const deviceIcon = (device: string) => {
  if (/iPhone|Android|Samsung/i.test(device)) return Smartphone
  if (/iPad|Tablet/i.test(device)) return Tablet
  return Monitor
}

export function ProfileView() {
  const { user, updateUserProfile, setUserAvatar, setBreadcrumbs } = useApp()
  const [activeTab, setActiveTab] = React.useState<Tab>('general')
  const [draft, setDraft] = React.useState<UserProfile | null>(user)
  const [saving, setSaving] = React.useState(false)
  const [showCropper, setShowCropper] = React.useState(false)
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  // Keep draft in sync with user (but allow local edits before save)
  React.useEffect(() => {
    if (user && !draft) setDraft(user)
  }, [user, draft])

  // Track if there are unsaved changes
  const hasChanges = React.useMemo(() => {
    if (!user || !draft) return false
    return JSON.stringify({ ...user, avatarUrl: undefined }) !== JSON.stringify({ ...draft, avatarUrl: undefined })
  }, [user, draft])

  // Warn before leaving with unsaved changes
  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasChanges])

  // Set breadcrumb
  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Profile', view: 'settings' }])
  }, [setBreadcrumbs])

  if (!user || !draft) return null

  // ====================== Update draft field ======================
  const update = (field: keyof UserProfile, value: any) => {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev)
  }

  // ====================== Save profile ======================
  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      // Real impl: PUT /api/v1/profile
      // const resp = await fetch('/api/v1/profile?XTransformPort=3000', {
      //   method: 'PUT', headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(draft),
      // })
      // const data = await resp.json()
      // if (!data.success) throw new Error(data.error)

      // Simulate API delay
      await new Promise(r => setTimeout(r, 800))

      // Update the global store → header + nav avatars update instantly
      updateUserProfile(draft)
      toast('✓ Profile updated successfully')
    } catch (e) {
      toast('Failed to save profile: ' + (e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setDraft(user)
    toast('Changes discarded', 'info')
  }

  // ====================== Avatar upload ======================
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast('Unsupported file type. Use PNG, JPG, or WEBP.', 'error')
      return
    }
    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast(`File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Max 5 MB.`, 'error')
      return
    }
    // Open cropper
    setPendingFile(file)
    setShowCropper(true)
  }

  const handleCropSave = async (croppedBlob: Blob, dataUrl: string) => {
    setShowCropper(false)
    setPendingFile(null)
    setUploadingAvatar(true)
    try {
      // Optimistic update — show new avatar immediately
      setUserAvatar(dataUrl)
      toast('Uploading avatar…')

      // Real impl: POST /api/v1/profile/avatar with FormData
      // const formData = new FormData()
      // formData.append('file', croppedBlob, 'avatar.webp')
      // const resp = await fetch('/api/v1/profile/avatar?XTransformPort=3000', { method: 'POST', body: formData })
      // const data = await resp.json()
      // if (!data.success) throw new Error(data.error)
      // setUserAvatar(data.avatarUrl)

      await new Promise(r => setTimeout(r, 1200))
      toast('✓ Avatar uploaded successfully')
    } catch (e) {
      // Rollback on failure
      setUserAvatar(user.avatarUrl)
      toast('Avatar upload failed: ' + (e as Error).message, 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user.avatarUrl) return
    if (!confirm('Remove your profile picture?')) return
    setUploadingAvatar(true)
    try {
      // Real impl: DELETE /api/v1/profile/avatar
      setUserAvatar(undefined)
      toast('✓ Avatar removed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ====================== Storage usage ======================
  const storageUsed = 4.2 // GB
  const storageQuota = 50 // GB

  // ====================== Render ======================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass cf-lift shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <User size={20} className="text-primary" /> My Profile
          </h1>
          <p className="text-xs text-muted-foreground">Manage your account, security, and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600"
            >
              <AlertTriangle size={12} /> Unsaved changes
            </motion.span>
          )}
          {hasChanges && (
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <X size={13} /> Discard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
              hasChanges && !saving
                ? 'bg-primary text-primary-foreground hover:shadow-glow'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* ====================== LEFT PANEL — Profile card ====================== */}
        <div className="space-y-4">
          <div className="glass cf-lift shadow-float rounded-2xl p-5 text-center">
            {/* Avatar */}
            <div className="relative mx-auto w-fit">
              <div className="relative">
                <Avatar
                  name={draft.displayName || draft.firstName}
                  size={120}
                  avatarUrl={draft.avatarUrl}
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 grid place-items-center rounded-full bg-black/40">
                    <Loader2 size={28} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              {/* Upload button overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-110 active:scale-95"
                aria-label="Upload profile picture"
                title="Upload profile picture"
              >
                <Camera size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Name + role */}
            <h2 className="mt-3 text-lg font-bold">{draft.displayName || `${draft.firstName} ${draft.lastName}`}</h2>
            <p className="text-xs text-muted-foreground">{draft.jobTitle}</p>
            <span className="mt-1 inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {draft.role}
            </span>

            {/* Upload / Delete buttons */}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <Upload size={12} /> Upload
              </button>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 text-xs font-medium hover:bg-accent sm:hidden"
              >
                <Camera size={12} /> Camera
              </button>
              {draft.avatarUrl && (
                <button
                  onClick={handleDeleteAvatar}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>

            <p className="mt-2 text-[10px] text-muted-foreground">
              PNG, JPG, or WEBP · Max 5 MB · Square recommended
            </p>
          </div>

          {/* Status card */}
          <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account status</span>
                <span className="flex items-center gap-1 font-medium text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium">{draft.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{draft.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-mono text-[11px]">{draft.employeeId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">Nov 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">2FA</span>
                <span className={cn('font-medium', draft.twoFactorEnabled ? 'text-emerald-500' : 'text-amber-500')}>
                  {draft.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Storage usage */}
          <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 size={12} /> Storage
            </h3>
            <p className="text-2xl font-bold">{storageUsed} <span className="text-sm font-normal text-muted-foreground">/ {storageQuota} GB</span></p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" style={{ width: `${(storageUsed / storageQuota) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {Math.round((storageUsed / storageQuota) * 100)}% used · {storageQuota - storageUsed} GB free
            </p>
          </div>
        </div>

        {/* ====================== RIGHT PANEL — Tabs ====================== */}
        <div className="glass cf-lift shadow-float rounded-2xl p-4">
          {/* Tab bar */}
          <div className="cf-scroll mb-4 flex gap-1 overflow-x-auto border-b border-border/60 pb-2">
            {tabs.map(tab => {
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'cf-focus-ring relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="profile-tab-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {activeTab === 'general' && <GeneralTab draft={draft} update={update} />}
              {activeTab === 'contact' && <ContactTab draft={draft} update={update} />}
              {activeTab === 'security' && <SecurityTab draft={draft} update={update} />}
              {activeTab === 'preferences' && <PreferencesTab draft={draft} update={update} />}
              {activeTab === 'sessions' && <SessionsTab />}
              {activeTab === 'notifications' && <NotificationsTab draft={draft} update={update} />}
              {activeTab === 'activity' && <ActivityTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Image cropper modal */}
      <AnimatePresence>
        {showCropper && pendingFile && (
          <ImageCropper
            file={pendingFile}
            onSave={handleCropSave}
            onCancel={() => { setShowCropper(false); setPendingFile(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ====================== General Tab ======================
function GeneralTab({ draft, update }: { draft: UserProfile; update: (field: keyof UserProfile, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First Name" required>
          <input value={draft.firstName} onChange={e => update('firstName', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Last Name" required>
          <input value={draft.lastName} onChange={e => update('lastName', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Display Name" required hint="Shown across the app">
          <input value={draft.displayName} onChange={e => update('displayName', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Username" required hint="3-30 chars: letters, numbers, . _ -">
          <input value={draft.username} onChange={e => update('username', e.target.value)} className="profile-input font-mono" />
        </Field>
        <Field label="Employee ID">
          <input value={draft.employeeId} onChange={e => update('employeeId', e.target.value)} className="profile-input font-mono" />
        </Field>
        <Field label="Job Title">
          <input value={draft.jobTitle} onChange={e => update('jobTitle', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Department">
          <select value={draft.department} onChange={e => update('department', e.target.value)} className="profile-input">
            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </Field>
        <Field label="Company">
          <input value={draft.company} onChange={e => update('company', e.target.value)} className="profile-input" />
        </Field>
      </div>

      <Field label="Biography" hint={`${draft.bio.length}/500 characters`}>
        <textarea
          value={draft.bio}
          onChange={e => update('bio', e.target.value.slice(0, 500))}
          rows={3}
          className="profile-input resize-none"
          placeholder="Tell us about yourself…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date of Birth (optional)">
          <input type="date" value={draft.dateOfBirth || ''} onChange={e => update('dateOfBirth', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Gender (optional)">
          <select value={draft.gender || ''} onChange={e => update('gender', e.target.value)} className="profile-input">
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select value={draft.timezone} onChange={e => update('timezone', e.target.value)} className="profile-input">
            {['Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'].map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Language">
          <select value={draft.language} onChange={e => update('language', e.target.value)} className="profile-input">
            <option value="en">English</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>
        </Field>
        <Field label="Profile visibility">
          <select value={draft.profileVisibility} onChange={e => update('profileVisibility', e.target.value)} className="profile-input">
            <option value="public">Public — visible to everyone</option>
            <option value="organization">Organization — visible to colleagues</option>
            <option value="department">Department — visible to your dept only</option>
            <option value="private">Private — only you</option>
          </select>
        </Field>
      </div>
    </div>
  )
}

// ====================== Contact Tab ======================
function ContactTab({ draft, update }: { draft: UserProfile; update: (field: keyof UserProfile, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" required icon={Mail}>
          <input type="email" value={draft.email} onChange={e => update('email', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Phone" icon={Phone}>
          <input value={draft.phone} onChange={e => update('phone', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Mobile" icon={Phone}>
          <input value={draft.mobile} onChange={e => update('mobile', e.target.value)} className="profile-input" />
        </Field>
        <Field label="WhatsApp" icon={Phone}>
          <input value={draft.whatsapp} onChange={e => update('whatsapp', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Office Extension">
          <input value={draft.officeExtension} onChange={e => update('officeExtension', e.target.value)} className="profile-input" />
        </Field>
      </div>

      <Field label="Address" icon={MapPin}>
        <input value={draft.address} onChange={e => update('address', e.target.value)} className="profile-input" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="City">
          <input value={draft.city} onChange={e => update('city', e.target.value)} className="profile-input" />
        </Field>
        <Field label="State / Province">
          <input value={draft.state} onChange={e => update('state', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Country">
          <input value={draft.country} onChange={e => update('country', e.target.value)} className="profile-input" />
        </Field>
        <Field label="Postal Code">
          <input value={draft.postalCode} onChange={e => update('postalCode', e.target.value)} className="profile-input" />
        </Field>
      </div>
    </div>
  )
}

// ====================== Security Tab ======================
function SecurityTab({ draft, update }: { draft: UserProfile; update: (field: keyof UserProfile, value: any) => void }) {
  const [showPw, setShowPw] = React.useState({ current: false, new: false, confirm: false })
  const [pw, setPw] = React.useState({ current: '', new: '', confirm: '' })
  const [changingPw, setChangingPw] = React.useState(false)
  const [strength, setStrength] = React.useState<{ score: number; label: string; color: string }>({ score: 0, label: '—', color: 'bg-muted' })

  const computeStrength = (p: string) => {
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) s++
    const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong']
    const colors = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500']
    return { score: s, label: labels[s], color: colors[s] }
  }

  const handleChangePassword = async () => {
    if (pw.new !== pw.confirm) { toast('Passwords do not match', 'error'); return }
    if (pw.new.length < 12) { toast('Password must be at least 12 characters', 'error'); return }
    setChangingPw(true)
    await new Promise(r => setTimeout(r, 1000))
    toast('✓ Password changed successfully')
    setPw({ current: '', new: '', confirm: '' })
    setChangingPw(false)
  }

  return (
    <div className="space-y-6">
      {/* Change password */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Key size={15} className="text-primary" /> Change Password
        </h3>
        <div className="space-y-3">
          <Field label="Current Password">
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                value={pw.current}
                onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                className="profile-input pr-9"
                placeholder="••••••••••••"
              />
              <button onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showPw.new ? 'text' : 'password'}
                  value={pw.new}
                  onChange={e => { setPw(p => ({ ...p, new: e.target.value })); setStrength(computeStrength(e.target.value)) }}
                  className="profile-input pr-9"
                  placeholder="Min 12 characters"
                />
                <button onClick={() => setShowPw(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm New Password">
              <div className="relative">
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  value={pw.confirm}
                  onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                  className="profile-input pr-9"
                  placeholder="Re-enter new password"
                />
                <button onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
          </div>

          {/* Strength meter */}
          {pw.new && (
            <div className="rounded-lg bg-muted/40 p-3">
              <div className="flex items-center justify-between text-[10px] font-medium">
                <span className="text-muted-foreground">Password strength</span>
                <span className={strength.score >= 3 ? 'text-emerald-500' : strength.score >= 2 ? 'text-amber-500' : 'text-rose-500'}>{strength.label}</span>
              </div>
              <div className="mt-1.5 flex gap-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={cn('h-1.5 flex-1 rounded-full', i <= strength.score ? strength.color : 'bg-muted')} />
                ))}
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-[9px] text-muted-foreground">
                <li className={pw.new.length >= 12 ? 'text-emerald-500' : ''}>✓ 12+ characters</li>
                <li className={/[A-Z]/.test(pw.new) ? 'text-emerald-500' : ''}>✓ Uppercase letter</li>
                <li className={/[a-z]/.test(pw.new) ? 'text-emerald-500' : ''}>✓ Lowercase letter</li>
                <li className={/[0-9]/.test(pw.new) ? 'text-emerald-500' : ''}>✓ Number</li>
                <li className={/[^A-Za-z0-9]/.test(pw.new) ? 'text-emerald-500' : ''}>✓ Symbol (!@#$…)</li>
              </ul>
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={!pw.current || !pw.new || !pw.confirm || changingPw}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:shadow-glow disabled:opacity-50"
          >
            {changingPw ? <><Loader2 size={13} className="animate-spin" /> Updating…</> : <><Lock size={13} /> Update Password</>}
          </button>
        </div>
      </section>

      <hr className="border-border/60" />

      {/* 2FA */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield size={15} className="text-primary" /> Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Authenticator app</p>
            <p className="text-xs text-muted-foreground">
              {draft.twoFactorEnabled ? '✓ Enabled — extra security on every login' : 'Add an extra layer of security to your account'}
            </p>
          </div>
          <button
            onClick={() => { update('twoFactorEnabled', !draft.twoFactorEnabled); toast(draft.twoFactorEnabled ? '2FA disabled' : '2FA enabled') }}
            className={cn(
              'relative h-6 w-11 rounded-full transition-colors',
              draft.twoFactorEnabled ? 'bg-primary' : 'bg-muted'
            )}
          >
            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', draft.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>
      </section>

      <hr className="border-border/60" />

      {/* Recovery email */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Mail size={15} className="text-primary" /> Recovery Email
        </h3>
        <Field label="Recovery email" hint="Used to recover your account if you lose access">
          <input type="email" value={draft.recoveryEmail} onChange={e => update('recoveryEmail', e.target.value)} className="profile-input" />
        </Field>
      </section>
    </div>
  )
}

// ====================== Preferences Tab ======================
function PreferencesTab({ draft, update }: { draft: UserProfile; update: (field: keyof UserProfile, value: any) => void }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Moon size={15} className="text-primary" /> Appearance
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {([
            { key: 'light', label: 'Light', icon: Sun },
            { key: 'dark', label: 'Dark', icon: Moon },
            { key: 'system', label: 'System', icon: Monitor },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => update('theme', t.key)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                draft.theme === t.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              )}
            >
              <t.icon size={20} className={draft.theme === t.key ? 'text-primary' : 'text-muted-foreground'} />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Languages size={15} className="text-primary" /> Locale
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Language">
            <select value={draft.language} onChange={e => update('language', e.target.value)} className="profile-input">
              <option value="en">English</option>
              <option value="ms">Bahasa Melayu</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
            </select>
          </Field>
          <Field label="Timezone">
            <select value={draft.timezone} onChange={e => update('timezone', e.target.value)} className="profile-input">
              {['Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'].map(tz => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </select>
          </Field>
          <Field label="Date Format">
            <select value={draft.dateFormat} onChange={e => update('dateFormat', e.target.value)} className="profile-input">
              <option value="YYYY-MM-DD">2026-07-27 (ISO)</option>
              <option value="DD/MM/YYYY">27/07/2026 (European)</option>
              <option value="MM/DD/YYYY">07/27/2026 (US)</option>
            </select>
          </Field>
          <Field label="Time Format">
            <select value={draft.timeFormat} onChange={e => update('timeFormat', e.target.value)} className="profile-input">
              <option value="12h">12-hour (1:30 PM)</option>
              <option value="24h">24-hour (13:30)</option>
            </select>
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Briefcase size={15} className="text-primary" /> Account
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default landing page after login">
            <select value={draft.defaultLandingPage} onChange={e => update('defaultLandingPage', e.target.value)} className="profile-input">
              <option value="dashboard">Dashboard</option>
              <option value="files">Files</option>
              <option value="recent">Recent</option>
              <option value="favorites">Favorites</option>
              <option value="upload">Upload</option>
            </select>
          </Field>
          <Field label="Profile visibility">
            <select value={draft.profileVisibility} onChange={e => update('profileVisibility', e.target.value)} className="profile-input">
              <option value="public">Public</option>
              <option value="organization">Organization</option>
              <option value="department">Department</option>
              <option value="private">Private</option>
            </select>
          </Field>
        </div>
      </section>
    </div>
  )
}

// ====================== Sessions Tab ======================
function SessionsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Monitor size={15} className="text-primary" /> Active Sessions
        </h3>
        <button
          onClick={() => toast('Terminating all other sessions…')}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <LogOut size={12} /> Terminate All Other Sessions
        </button>
      </div>

      <div className="space-y-2">
        {mockSessions.map(s => {
          const DeviceIcon = deviceIcon(s.device)
          return (
            <div key={s.id} className={cn(
              'flex items-center gap-3 rounded-xl border p-3',
              s.isCurrent ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 bg-card/40'
            )}>
              <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.isCurrent ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground')}>
                <DeviceIcon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{s.device}</p>
                  {s.isCurrent && <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600">CURRENT</span>}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {s.browser} · {s.os} · {s.ipAddress}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span>{s.countryFlag} {s.city}, {s.country}</span>
                  <span className="mx-1">·</span>
                  <span>Active {formatDistanceToNow(new Date(s.lastActiveAt), { addSuffix: true })}</span>
                </p>
              </div>
              {!s.isCurrent && (
                <button
                  onClick={() => toast(`Session terminated: ${s.device}`)}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-medium hover:bg-accent"
                >
                  Logout
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ====================== Notifications Tab ======================
function NotificationsTab({ draft, update }: { draft: UserProfile; update: (field: keyof UserProfile, value: any) => void }) {
  const settings: { key: keyof UserProfile; label: string; desc: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: 'notifEmail', label: 'Email Notifications', desc: 'Receive notifications via email', icon: Mail },
    { key: 'notifPush', label: 'Push Notifications', desc: 'Browser + mobile push alerts', icon: Bell },
    { key: 'notifSecurityAlerts', label: 'Security Alerts', desc: 'Failed logins, new devices, password changes', icon: Shield },
    { key: 'notifUploads', label: 'Upload Notifications', desc: 'When files are uploaded or shared with you', icon: Upload },
    { key: 'notifMentions', label: 'Mention Notifications', desc: 'When someone @mentions you in a comment', icon: User },
    { key: 'notifSystemUpdates', label: 'System Updates', desc: 'Maintenance, new features, changelogs', icon: Activity },
  ]
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Bell size={15} className="text-primary" /> Notification Preferences
      </h3>
      {settings.map(s => {
        const enabled = draft[s.key] as boolean
        return (
          <div key={s.key} className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                <s.icon size={15} />
              </span>
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            <button
              onClick={() => update(s.key, !enabled)}
              className={cn('relative h-6 w-11 rounded-full transition-colors', enabled ? 'bg-primary' : 'bg-muted')}
            >
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', enabled ? 'translate-x-5' : 'translate-x-0.5')} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ====================== Activity Tab ======================
function ActivityTab() {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Activity size={15} className="text-primary" /> Recent Activity
      </h3>
      <div className="cf-scroll max-h-[500px] space-y-1 overflow-y-auto">
        {mockActivity.map(a => (
          <div key={a.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/40">
            <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Clock size={12} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium">{a.action}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })} · {a.ip} · {a.browser}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ====================== Field helper ======================
function Field({ label, required, hint, icon: Icon, children }: {
  label: string
  required?: boolean
  hint?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 flex items-center gap-1 text-xs font-medium">
        {Icon && <Icon size={11} className="text-muted-foreground" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
