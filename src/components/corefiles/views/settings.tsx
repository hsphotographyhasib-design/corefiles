'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, User, Shield, Palette, Database, Server,
  Bell, Globe, Monitor, Moon, Sun, Check, KeyRound, Smartphone, Mail,
  Lock, Eye, AlertTriangle, Download, Upload,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { useTheme } from 'next-themes'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { Avatar } from '@/components/corefiles/common/avatar'
import { cn } from '@/lib/utils'

export function SettingsView() {
  const { user } = useApp()
  const { theme, setTheme } = useTheme()
  const [tab, setTab] = React.useState<'profile' | 'security' | 'appearance' | 'storage' | 'system'>('profile')

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'security' as const, label: 'Security', icon: Shield },
    { key: 'appearance' as const, label: 'Appearance', icon: Palette },
    { key: 'storage' as const, label: 'Storage', icon: Database },
    { key: 'system' as const, label: 'System', icon: Server },
  ]

  return (
    <div className="space-y-4">
      <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SettingsIcon size={18} className="text-primary" /> Settings
        </h2>
        <p className="text-xs text-muted-foreground">Manage your account, security, and system preferences.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        {/* Tab nav */}
        <div className="glass shadow-float h-fit rounded-2xl p-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass cf-lift shadow-float rounded-2xl p-6"
        >
          {tab === 'profile' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold">Profile</h3>
              <div className="flex items-center gap-4">
                <Avatar name={user?.name || 'User'} size={80} />
                <div>
                  <button onClick={() => toast('Upload avatar dialog')} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:shadow-glow"><Upload size={12} className="inline mr-1" /> Upload new</button>
                  <p className="mt-1 text-[10px] text-muted-foreground">JPG, PNG or GIF · max 2MB</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Full name', value: user?.name },
                  { label: 'Email', value: user?.email, type: 'email' },
                  { label: 'Phone', value: '+60 12-345 6789' },
                  { label: 'Job title', value: 'Chief Executive Officer' },
                  { label: 'Department', value: 'Administration' },
                  { label: 'Timezone', value: 'Asia/Kuala_Lumpur (UTC+8)' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="mb-1 block text-xs font-medium">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      defaultValue={f.value}
                      className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Founder & CEO of Hasanur Jaya Sdn. Bhd. — building Malaysia's most reliable engineering document management platform."
                  className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button className="rounded-lg border border-border px-4 py-2 text-xs hover:bg-accent">Cancel</button>
                <button onClick={() => toast('Profile saved')} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">Save changes</button>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold">Security</h3>

              {/* Password */}
              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium"><Lock size={14} /> Change password</h4>
                <div className="space-y-2">
                  <div className="relative">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input type="password" placeholder="Current password" className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary" />
                  </div>
                  <input type="password" placeholder="New password (min 12 chars)" className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary" />
                  <input type="password" placeholder="Confirm new password" className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary" />
                </div>
                <button onClick={() => toast('Password updated')} className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Update password</button>
              </div>

              {/* 2FA */}
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-medium"><Smartphone size={14} /> Two-factor authentication</h4>
                    <p className="mt-1 text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Enabled</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toast('2FA reconfiguration started')} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">Reconfigure</button>
                  <button onClick={() => toast('Backup codes regenerated')} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">Backup codes</button>
                  <button onClick={() => toast('2FA disabled', 'error')} className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">Disable</button>
                </div>
              </div>

              {/* Active sessions */}
              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-medium"><Monitor size={14} /> Active sessions</h4>
                <div className="space-y-2">
                  {[
                    { device: 'MacBook Pro 16" · Chrome 138', location: 'Kuala Lumpur, MY', ip: '203.106.84.12', current: true, lastActive: 'Active now' },
                    { device: 'iPhone 15 Pro · Safari 18', location: 'Kuala Lumpur, MY', ip: '118.101.222.7', current: false, lastActive: '8 min ago' },
                    { device: 'Dell OptiPlex · Chrome 138', location: 'Singapore', ip: '175.136.45.8', current: false, lastActive: '2h ago' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border/40 p-2.5">
                      <Monitor size={14} className="text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{s.device}</p>
                        <p className="text-[10px] text-muted-foreground">{s.location} · {s.ip} · {s.lastActive}</p>
                      </div>
                      {s.current ? (
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600">Current</span>
                      ) : (
                        <button onClick={() => toast('Session revoked', 'info')} className="text-xs text-rose-600 hover:underline">Revoke</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold">Appearance</h3>

              <div>
                <label className="mb-2 block text-xs font-medium">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { key: 'light', label: 'Light', icon: Sun },
                    { key: 'dark', label: 'Dark', icon: Moon },
                    { key: 'system', label: 'System', icon: Monitor },
                  ] as const).map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                        theme === t.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      )}
                    >
                      <t.icon size={20} className={theme === t.key ? 'text-primary' : 'text-muted-foreground'} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">Accent color</label>
                <div className="flex flex-wrap gap-2">
                  {['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'].map(c => (
                    <button key={c} className={cn('h-8 w-8 rounded-lg ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110', c === '#10b981' ? 'ring-primary' : 'ring-transparent')} style={{ background: c }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium">Density</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="rounded-xl border-2 border-primary p-3 text-left">
                    <p className="text-xs font-medium">Comfortable</p>
                    <p className="text-[10px] text-muted-foreground">More spacing, easier to scan</p>
                  </button>
                  <button className="rounded-xl border-2 border-border p-3 text-left hover:border-primary/40">
                    <p className="text-xs font-medium">Compact</p>
                    <p className="text-[10px] text-muted-foreground">Tighter spacing, more content</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <p className="text-xs font-medium">Reduce motion</p>
                  <p className="text-[10px] text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <button className="relative h-5 w-9 rounded-full bg-muted"><span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow" /></button>
              </div>
            </div>
          )}

          {tab === 'storage' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold">Storage</h3>
              <div className="rounded-xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">My storage</p>
                    <p className="text-xs text-muted-foreground">4.2 GB used of 50 GB quota</p>
                  </div>
                  <button onClick={() => toast('Request quota increase')} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Request increase</button>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" style={{ width: '8%' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'Documents', size: '2.1 GB', color: '#10b981' },
                  { type: 'Images', size: '1.4 GB', color: '#0ea5e9' },
                  { type: 'Videos', size: '480 MB', color: '#8b5cf6' },
                  { type: 'Audio', size: '120 MB', color: '#f59e0b' },
                  { type: 'Archives', size: '85 MB', color: '#ef4444' },
                  { type: 'Other', size: '15 MB', color: '#64748b' },
                ].map(s => (
                  <div key={s.type} className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                      <p className="text-[10px] text-muted-foreground">{s.type}</p>
                    </div>
                    <p className="mt-1 text-sm font-bold">{s.size}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => toast('Exporting my data as ZIP')} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs hover:bg-accent">
                <Download size={13} /> Export all my data (GDPR)
              </button>
            </div>
          )}

          {tab === 'system' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold">System</h3>

              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 text-sm font-medium">Instance information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ['Version', 'v2.4.1'],
                    ['Build', '2026.07.26'],
                    ['Environment', 'Production'],
                    ['License', 'Enterprise (perpetual)'],
                    ['Domain', 'corefiles.hasanurjaya.com'],
                    ['Datacenter', 'On-prem · Kuala Lumpur'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-muted/40 px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">{k}</p>
                      <p className="font-medium">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/60 p-4">
                <h4 className="mb-3 text-sm font-medium">Email notifications</h4>
                <div className="space-y-2">
                  {[
                    'File shared with me',
                    'New comment on my file',
                    'Approval request',
                    'Storage almost full (90%)',
                    'Failed login attempts',
                    'Weekly summary digest',
                  ].map(s => (
                    <label key={s} className="flex items-center justify-between rounded-lg border border-border/40 p-2.5">
                      <span className="text-xs">{s}</span>
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-primary" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-600"><AlertTriangle size={14} /> Danger zone</h4>
                <p className="mb-3 text-xs text-muted-foreground">Irreversible actions. Proceed with caution.</p>
                <div className="flex gap-2">
                  <button onClick={() => toast('Account scheduled for deletion in 30 days', 'error')} className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                    Delete my account
                  </button>
                  <button onClick={() => toast('Wipe all cached data on this device', 'info')} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
                    Clear local cache
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
