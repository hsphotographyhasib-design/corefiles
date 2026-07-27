'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Boxes, ShieldCheck, Key, Database, Cloud, Bell, FileText, Server,
  CheckCircle2, Clock, XCircle, Play, Plus, Copy, MoreHorizontal,
  HardDrive, RefreshCw, AlertTriangle, Lock,
} from 'lucide-react'
import { files, departments, apiKeys, fmtBytes, totalStorageUsed, totalStorageQuota, userById } from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const backups = [
  { id: 'b-1', name: 'daily-2026-07-26-03:00.tar.gz', size: '4.2 GB', created: '3h ago', type: 'daily', status: 'verified', automated: true },
  { id: 'b-2', name: 'daily-2026-07-25-03:00.tar.gz', size: '4.1 GB', created: '1d ago', type: 'daily', status: 'verified', automated: true },
  { id: 'b-3', name: 'weekly-2026-07-21-03:00.tar.gz', size: '4.0 GB', created: '5d ago', type: 'weekly', status: 'verified', automated: true },
  { id: 'b-4', name: 'daily-2026-07-24-03:00.tar.gz', size: '4.1 GB', created: '2d ago', type: 'daily', status: 'verified', automated: true },
  { id: 'b-5', name: 'manual-2026-07-23-pre-deploy.tar.gz', size: '4.0 GB', created: '3d ago', type: 'manual', status: 'verified', automated: false },
]

const pendingFiles = files.filter(f => f.approvalStatus === 'pending')

export function AdminView() {
  const { toast, setView } = useApp()
  const [tab, setTab] = React.useState<'overview' | 'storage' | 'backups' | 'apikeys' | 'security' | 'approvals'>('overview')

  return (
    <div className="space-y-4">
      <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Boxes size={18} className="text-primary" /> Admin Panel
        </h2>
        <p className="text-xs text-muted-foreground">Manage system-wide settings, storage, backups, API keys, security, and approvals.</p>
      </div>

      {/* Tabs */}
      <div className="glass shadow-float flex flex-wrap gap-1 rounded-2xl p-2">
        {([
          { key: 'overview', label: 'Overview', icon: Boxes },
          { key: 'approvals', label: 'Approvals', icon: Clock, badge: pendingFiles.length },
          { key: 'storage', label: 'Storage', icon: HardDrive },
          { key: 'backups', label: 'Backups', icon: Database },
          { key: 'apikeys', label: 'API Keys', icon: Key },
          { key: 'security', label: 'Security', icon: ShieldCheck },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <t.icon size={14} />
            {t.label}
            {'badge' in t && t.badge ? (
              <span className={cn('rounded-full px-1.5 text-[10px] font-bold', tab === t.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-rose-500 text-white')}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Storage used', value: fmtBytes(totalStorageUsed()), icon: HardDrive, color: 'from-emerald-500 to-teal-600' },
              { label: 'API keys active', value: apiKeys.filter(k => !k.revoked).length, icon: Key, color: 'from-violet-500 to-purple-600' },
              { label: 'Backups (30d)', value: 31, icon: Database, color: 'from-sky-500 to-blue-600' },
              { label: 'Security score', value: '94/100', icon: ShieldCheck, color: 'from-emerald-500 to-teal-600' },
            ].map(s => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass cf-lift-sm shadow-float rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white', s.color)}>
                    <s.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-bold">{s.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass shadow-float rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle size={15} className="text-amber-500" /> Pending admin actions
            </h3>
            <div className="space-y-2">
              {[
                { text: `${pendingFiles.length} files awaiting approval`, action: () => setTab('approvals') },
                { text: '1 API key last used 5 days ago — review or revoke', action: () => setTab('apikeys') },
                { text: 'Backup verification overdue for daily-2026-07-23', action: () => setTab('backups') },
                { text: 'Storage at 67% — consider expanding MinIO capacity', action: () => setTab('storage') },
              ].map((a, i) => (
                <button key={i} onClick={a.action} className="flex w-full items-center justify-between rounded-lg border border-border/60 p-3 text-left text-xs hover:bg-accent/40">
                  <span className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-500/10 text-amber-500"><AlertTriangle size={12} /></span>
                    {a.text}
                  </span>
                  <span className="text-primary">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approvals */}
      {tab === 'approvals' && (
        <div className="glass shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Clock size={15} className="text-primary" /> Files awaiting approval
          </h3>
          <div className="space-y-2">
            {pendingFiles.map(f => {
              const owner = userById(f.ownerId)
              return (
                <div key={f.id} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>Submitted by {owner?.name}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(f.updatedAt), { addSuffix: true })}</span>
                        <span>·</span>
                        <span>{f.path.join(' / ')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toast(`Approved: ${f.name}`)} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600">
                        Approve
                      </button>
                      <button onClick={() => toast(`Rejected: ${f.name}`, 'error')} className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600">
                        Reject
                      </button>
                      <button onClick={() => toast('Preview opened')} className="rounded-lg border border-border p-2 hover:bg-accent">
                        <FileText size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {pendingFiles.length === 0 && (
              <div className="py-8 text-center">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-medium">No files pending approval</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storage */}
      {tab === 'storage' && (
        <div className="space-y-4">
          <div className="glass shadow-float rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <HardDrive size={15} className="text-primary" /> MinIO Storage Configuration
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Total quota</p>
                <p className="text-2xl font-bold">{fmtBytes(totalStorageQuota())}</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(totalStorageUsed() / totalStorageQuota() * 100)}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{Math.round(totalStorageUsed() / totalStorageQuota() * 100)}% used · {fmtBytes(totalStorageQuota() - totalStorageUsed())} free</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Buckets</p>
                <div className="mt-1 space-y-1 text-xs">
                  <div className="flex justify-between"><span className="font-mono">corefiles-prod</span><span className="text-emerald-500">online</span></div>
                  <div className="flex justify-between"><span className="font-mono">corefiles-backup</span><span className="text-emerald-500">online</span></div>
                  <div className="flex justify-between"><span className="font-mono">corefiles-thumbnails</span><span className="text-emerald-500">online</span></div>
                  <div className="flex justify-between"><span className="font-mono">corefiles-archive</span><span className="text-emerald-500">online</span></div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Replication factor', value: '3 nodes' },
                { label: 'Encryption', value: 'AES-256-SSE' },
                { label: 'Versioning', value: 'Enabled' },
              ].map(c => (
                <div key={c.label} className="rounded-lg border border-border/60 p-3">
                  <p className="text-[10px] text-muted-foreground">{c.label}</p>
                  <p className="text-sm font-semibold">{c.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass shadow-float rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-semibold">Department quotas</h3>
            <div className="space-y-2">
              {departments.map(d => {
                const pct = Math.round((d.storageUsedBytes / d.storageQuotaBytes) * 100)
                return (
                  <div key={d.id} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="w-32 text-xs font-medium">{d.name}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={cn('h-full rounded-full', pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-32 text-right text-[10px] text-muted-foreground">{fmtBytes(d.storageUsedBytes)} / {fmtBytes(d.storageQuotaBytes)}</span>
                    <button onClick={() => toast(`Editing quota for ${d.name}`)} className="rounded p-1 hover:bg-accent"><MoreHorizontal size={12} /></button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Backups */}
      {tab === 'backups' && (
        <div className="space-y-4">
          <div className="glass shadow-float flex items-center justify-between rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><Database size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Automatic backups enabled</p>
                <p className="text-xs text-muted-foreground">Daily at 03:00 SGT · Weekly on Sundays · 30-day retention</p>
              </div>
            </div>
            <button onClick={() => toast('Manual backup started')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
              <Play size={13} /> Backup now
            </button>
          </div>

          <div className="glass shadow-float overflow-hidden rounded-2xl">
            <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Backup history</h3>
            </div>
            <div className="cf-scroll max-h-96 overflow-y-auto">
              {backups.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 border-b border-border/40 px-4 py-3 hover:bg-accent/40">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Database size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium font-mono">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.size} · {b.created} · {b.automated ? 'Automated' : 'Manual'}</p>
                  </div>
                  <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium',
                    b.status === 'verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}>
                    {b.status}
                  </span>
                  <button onClick={() => toast(`Restoring ${b.name}…`)} className="rounded-md p-1.5 hover:bg-accent"><RefreshCw size={13} /></button>
                  <button onClick={() => toast('Backup verified')} className="rounded-md p-1.5 hover:bg-accent"><CheckCircle2 size={13} /></button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      {tab === 'apikeys' && (
        <div className="glass shadow-float rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Key size={15} className="text-primary" /> API Keys
            </h3>
            <button onClick={() => toast('New API key generated')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
              <Plus size={13} /> Generate key
            </button>
          </div>
          <div className="space-y-2">
            {apiKeys.map(k => {
              const creator = userById(k.createdBy)
              return (
                <div key={k.id} className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('grid h-9 w-9 place-items-center rounded-lg', k.revoked ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500')}>
                      <Key size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{k.name} {k.revoked && <span className="ml-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-600">REVOKED</span>}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{k.keyMasked}</p>
                    </div>
                    <div className="hidden text-xs text-muted-foreground sm:block">
                      <p>Created {formatDistanceToNow(new Date(k.createdAt), { addSuffix: true })}</p>
                      <p>Last used {k.lastUsed ? formatDistanceToNow(new Date(k.lastUsed), { addSuffix: true }) : 'never'}</p>
                    </div>
                    <div className="flex gap-1">
                      {k.scopes.map(s => <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-mono">{s}</span>)}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toast('API key copied')} className="rounded p-1.5 hover:bg-accent"><Copy size={12} /></button>
                      <button onClick={() => toast(k.revoked ? 'API key already revoked' : 'API key revoked', k.revoked ? 'info' : 'error')} className="rounded p-1.5 hover:bg-accent">
                        <Lock size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="glass shadow-float rounded-2xl p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={15} className="text-primary" /> Security overview
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: 'Security score', value: '94 / 100', status: 'good' },
                { label: 'Failed logins (24h)', value: '2 attempts', status: 'warn' },
                { label: 'Suspended accounts', value: '1 user', status: 'warn' },
                { label: '2FA adoption', value: '67%', status: 'info' },
                { label: 'Active sessions', value: '12 sessions', status: 'good' },
                { label: 'ClamAV scans (24h)', value: '847 files', status: 'good' },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border/60 p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-lg font-bold">{s.value}</p>
                  <span className={cn('mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium capitalize',
                    s.status === 'good' ? 'bg-emerald-500/10 text-emerald-600' :
                    s.status === 'warn' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-sky-500/10 text-sky-600')}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass shadow-float rounded-2xl p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Lock size={15} className="text-primary" /> Security policies
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Password rotation (90 days)', enabled: true },
                { label: 'Require 2FA for admins', enabled: true },
                { label: 'IP allowlist', enabled: false },
                { label: 'Session timeout (30 min)', enabled: true },
                { label: 'Virus scan on upload (ClamAV)', enabled: true },
                { label: 'Watermark on download', enabled: true },
                { label: 'Signed download URLs (5 min expiry)', enabled: true },
                { label: 'Rate limiting (100 req/min)', enabled: true },
                { label: 'CSRF protection', enabled: true },
                { label: 'Content Security Policy (CSP)', enabled: true },
              ].map(p => (
                <label key={p.label} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                  <span className="text-xs">{p.label}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', p.enabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                    {p.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
