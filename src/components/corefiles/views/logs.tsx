/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ScrollText, FileText, Activity, Search, Filter, Download, ChevronDown,
  Globe, Monitor, Smartphone, Tablet, CheckCircle2, XCircle, Clock,
  ArrowUpDown, ShieldAlert, User as UserIcon,
} from 'lucide-react'
import {
  auditLogs, loginLogs, activityLogs, userById, type ActivityLog,
} from '@/components/corefiles/data/mock'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

const actionColor: Record<ActivityLog['action'], string> = {
  viewed: 'text-sky-500 bg-sky-500/10',
  downloaded: 'text-violet-500 bg-violet-500/10',
  uploaded: 'text-emerald-500 bg-emerald-500/10',
  deleted: 'text-rose-500 bg-rose-500/10',
  renamed: 'text-amber-500 bg-amber-500/10',
  shared: 'text-cyan-500 bg-cyan-500/10',
  moved: 'text-indigo-500 bg-indigo-500/10',
  restored: 'text-emerald-500 bg-emerald-500/10',
  permission_changed: 'text-fuchsia-500 bg-fuchsia-500/10',
  locked: 'text-orange-500 bg-orange-500/10',
  unlocked: 'text-emerald-500 bg-emerald-500/10',
  favorited: 'text-yellow-500 bg-yellow-500/10',
  commented: 'text-blue-500 bg-blue-500/10',
  version_created: 'text-purple-500 bg-purple-500/10',
}

const deviceIcon = (device: string) => {
  if (/iPhone|Android|Samsung/i.test(device)) return Smartphone
  if (/iPad|Tablet/i.test(device)) return Tablet
  return Monitor
}

function LogToolbar({ query, setQuery, count, label }: { query: string; setQuery: (v: string) => void; count: number; label: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[200px] flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={`Search ${label.toLowerCase()}…`}
          className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
        <Filter size={13} /> Filters
        <ChevronDown size={11} />
      </button>
      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
        <ArrowUpDown size={13} /> Sort
      </button>
      <button onClick={() => toast('Export started — check notifications')} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
        <Download size={13} /> Export
      </button>
      <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{count} records</span>
    </div>
  )
}

// ---------------- Audit Logs ----------------

export function AuditLogsView() {
  const [query, setQuery] = React.useState('')
  const filtered = auditLogs.filter(a => {
    if (!query) return true
    const actor = userById(a.actorId)?.name || ''
    return actor.toLowerCase().includes(query.toLowerCase()) ||
      a.action.toLowerCase().includes(query.toLowerCase()) ||
      a.resource.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ScrollText size={18} className="text-primary" /> Audit Logs
        </h2>
        <p className="text-xs text-muted-foreground">
          Immutable record of every administrative action. Logs are never permanently deleted — retention: 7 years.
        </p>
      </div>

      <div className="glass shadow-float rounded-2xl p-3">
        <LogToolbar query={query} setQuery={setQuery} count={filtered.length} label="audit logs" />
      </div>

      <div className="glass shadow-float overflow-hidden rounded-2xl">
        <div className="cf-scroll overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Change</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Reason</th>
                <th className="hidden px-4 py-3 text-left xl:table-cell">IP / Browser</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const actor = userById(a.actorId)
                return (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-t border-border/40 hover:bg-accent/40">
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(a.timestamp), 'PPpp')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={actor?.name || 'Unknown'} size={26} />
                        <span className="text-xs">{actor?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-mono text-primary">{a.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{a.resource}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{a.resourceId}</p>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-2 text-xs">
                        {a.oldValue && <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-600 line-through">{a.oldValue}</span>}
                        <span>→</span>
                        {a.newValue && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600">{a.newValue}</span>}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{a.reason || '—'}</td>
                    <td className="hidden px-4 py-3 text-xs xl:table-cell">
                      <p className="font-mono">{a.ip}</p>
                      <p className="text-[10px] text-muted-foreground">{a.browser}</p>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldAlert size={12} /> Logs are append-only · SHA-256 chained · WORM storage
          </span>
          <span>{filtered.length} of {auditLogs.length}</span>
        </div>
      </div>
    </div>
  )
}

// ---------------- Login Logs ----------------

export function LoginLogsView() {
  const [query, setQuery] = React.useState('')
  const filtered = loginLogs.filter(l => {
    if (!query) return true
    const u = userById(l.userId)
    return (u?.name || '').toLowerCase().includes(query.toLowerCase()) ||
      l.ip.includes(query) || l.country.toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText size={18} className="text-primary" /> Login Logs
        </h2>
        <p className="text-xs text-muted-foreground">
          Every authentication attempt — including failures, IP, device, and geolocation.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass shadow-float rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 size={18} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Successful logins (24h)</p>
              <p className="text-xl font-bold">{loginLogs.filter(l => l.result === 'success').length}</p>
            </div>
          </div>
        </div>
        <div className="glass shadow-float rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10 text-rose-500"><XCircle size={18} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Failed attempts (24h)</p>
              <p className="text-xl font-bold">{loginLogs.filter(l => l.result === 'failed').length}</p>
            </div>
          </div>
        </div>
        <div className="glass shadow-float rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><Globe size={18} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Unique countries</p>
              <p className="text-xl font-bold">{new Set(loginLogs.map(l => l.country)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass shadow-float rounded-2xl p-3">
        <LogToolbar query={query} setQuery={setQuery} count={filtered.length} label="login logs" />
      </div>

      <div className="glass shadow-float overflow-hidden rounded-2xl">
        <div className="cf-scroll overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">When</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">Result</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">IP Address</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Device / Browser</th>
                <th className="hidden px-4 py-3 text-left xl:table-cell">Location</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => {
                const u = userById(l.userId)
                const DeviceIcon = deviceIcon(l.device)
                return (
                  <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-t border-border/40 hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u ? <Avatar name={u.name} size={26} /> : <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500/10 text-rose-500"><UserIcon size={13} /></div>}
                        <div>
                          <p className="text-xs font-medium">{u?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-muted-foreground">{u?.email || l.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium">{formatDistanceToNow(new Date(l.timestamp), { addSuffix: true })}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(l.timestamp), 'PPpp')}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className={cn('flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium w-fit',
                        l.result === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600')}>
                        {l.result === 'success' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {l.result}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 font-mono text-xs md:table-cell">{l.ip}</td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-2">
                        <DeviceIcon size={13} className="text-muted-foreground" />
                        <div>
                          <p className="text-xs">{l.device}</p>
                          <p className="text-[10px] text-muted-foreground">{l.browser} · {l.os}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span>{l.countryFlag}</span>
                        <span>{l.country}</span>
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs lg:table-cell">
                      {l.durationSec > 0 ? (
                        <span className="flex items-center gap-1"><Clock size={11} /> {Math.round(l.durationSec / 60)}m</span>
                      ) : <span className="text-muted-foreground">Active</span>}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------- Activity Logs ----------------

export function ActivityLogsView() {
  const [query, setQuery] = React.useState('')
  const filtered = activityLogs.filter(a => {
    if (!query) return true
    const u = userById(a.userId)
    return (u?.name || '').toLowerCase().includes(query.toLowerCase()) ||
      a.action.includes(query.toLowerCase()) ||
      (a.fileName || '').toLowerCase().includes(query.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity size={18} className="text-primary" /> File Activity Logs
        </h2>
        <p className="text-xs text-muted-foreground">
          Every file operation across the platform — view, edit, share, move, delete, restore.
        </p>
      </div>

      <div className="glass shadow-float rounded-2xl p-3">
        <LogToolbar query={query} setQuery={setQuery} count={filtered.length} label="activity logs" />
      </div>

      <div className="glass shadow-float rounded-2xl p-4">
        <div className="cf-scroll max-h-[60vh] space-y-1 overflow-y-auto">
          {filtered.map((log, i) => {
            const actor = userById(log.userId)
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/40"
              >
                <Avatar name={actor?.name || 'Unknown'} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug">
                    <span className="font-semibold">{actor?.name || 'Unknown'}</span>{' '}
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', actionColor[log.action])}>
                      {log.action.replace(/_/g, ' ')}
                    </span>{' '}
                    <span className="text-muted-foreground">{log.fileName}</span>
                  </p>
                  {(log.oldValue || log.newValue) && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      {log.oldValue && <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-rose-600 line-through">{log.oldValue}</span>}
                      {log.oldValue && log.newValue && <span>→</span>}
                      {log.newValue && <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600">{log.newValue}</span>}
                    </div>
                  )}
                  {log.reason && <p className="mt-1 text-[10px] italic text-muted-foreground">Reason: {log.reason}</p>}
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })} · {log.ip} · {log.browser} · {log.os}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
