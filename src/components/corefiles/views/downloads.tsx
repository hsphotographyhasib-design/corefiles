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
  Download, FileText, ArrowDownToLine, Clock, Filter, Trash2, RefreshCw,
  Smartphone, Monitor, Apple,
} from 'lucide-react'
import { files, userById, fmtBytes, fileTypeMeta } from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

/**
 * DownloadsView — download history log.
 * Distinct from Recent: shows every download action (file, when, what device,
 * what IP) — like a browser's download manager.
 */

interface DownloadRecord {
  id: string
  fileId: string
  userId: string
  timestamp: string
  device: 'MacBook Pro' | 'iPhone 15 Pro' | 'Dell OptiPlex' | 'iPad Pro'
  ip: string
  size: number
  status: 'complete' | 'failed' | 'in-progress'
}

const mockDownloads: DownloadRecord[] = [
  { id: 'dl-1', fileId: 'fl-1', userId: 'u-1', timestamp: new Date(Date.now() - 5 * 60_000).toISOString(), device: 'MacBook Pro', ip: '203.106.84.12', size: 4.2 * 1024 * 1024, status: 'complete' },
  { id: 'dl-2', fileId: 'fl-8', userId: 'u-3', timestamp: new Date(Date.now() - 18 * 60_000).toISOString(), device: 'Dell OptiPlex', ip: '175.136.45.8', size: 18.4 * 1024 * 1024, status: 'complete' },
  { id: 'dl-3', fileId: 'fl-11', userId: 'u-7', timestamp: new Date(Date.now() - 2 * 3600_000).toISOString(), device: 'MacBook Pro', ip: '203.106.84.12', size: 8.4 * 1024 * 1024, status: 'complete' },
  { id: 'dl-4', fileId: 'fl-15', userId: 'u-1', timestamp: new Date(Date.now() - 5 * 3600_000).toISOString(), device: 'iPhone 15 Pro', ip: '118.101.222.7', size: 184 * 1024 * 1024, status: 'complete' },
  { id: 'dl-5', fileId: 'fl-6', userId: 'u-7', timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(), device: 'MacBook Pro', ip: '175.136.45.8', size: 2.3 * 1024 * 1024, status: 'failed' },
  { id: 'dl-6', fileId: 'fl-9', userId: 'u-6', timestamp: new Date(Date.now() - 30 * 3600_000).toISOString(), device: 'iPad Pro', ip: '118.101.222.7', size: 22.1 * 1024 * 1024, status: 'complete' },
  { id: 'dl-7', fileId: 'fl-20', userId: 'u-9', timestamp: new Date(Date.now() - 50 * 3600_000).toISOString(), device: 'Dell OptiPlex', ip: '203.106.84.12', size: 8.9 * 1024 * 1024, status: 'complete' },
  { id: 'dl-8', fileId: 'fl-10', userId: 'u-3', timestamp: new Date(Date.now() - 70 * 3600_000).toISOString(), device: 'MacBook Pro', ip: '175.136.45.8', size: 12.6 * 1024 * 1024, status: 'complete' },
]

const deviceIcon = (device: DownloadRecord['device']) => {
  if (device.includes('iPhone') || device.includes('iPad')) return Smartphone
  return Monitor
}

export function DownloadsView() {
  const { setView, setSelectedFile, setCurrentFolder } = useApp()
  const [filter, setFilter] = React.useState<'all' | 'complete' | 'failed'>('all')

  const filtered = mockDownloads.filter(d => filter === 'all' || d.status === filter)
  const totalDownloaded = mockDownloads.filter(d => d.status === 'complete').reduce((s, d) => s + d.size, 0)

  return (
    <div className="space-y-4">
      <div className="glass cf-lift shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ArrowDownToLine size={18} className="text-primary" /> Downloads
          </h2>
          <p className="text-xs text-muted-foreground">
            Your download history · {mockDownloads.length} downloads · {fmtBytes(totalDownloaded)} transferred
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {(['all', 'complete', 'failed'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                filter === p ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
              )}
            >
              {p}
            </button>
          ))}
          <button onClick={() => toast('Clearing download history…')} className="ml-2 flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total downloads', value: mockDownloads.length, icon: Download, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Total transferred', value: fmtBytes(totalDownloaded), icon: ArrowDownToLine, color: 'text-sky-500 bg-sky-500/10' },
          { label: 'Failed downloads', value: mockDownloads.filter(d => d.status === 'failed').length, icon: RefreshCw, color: 'text-rose-500 bg-rose-500/10' },
          { label: 'Avg download time', value: '4.2s', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
        ].map(s => (
          <div key={s.label} className="glass cf-lift-sm shadow-float rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
              <span className={cn('grid h-10 w-10 place-items-center rounded-xl', s.color)}>
                <s.icon size={18} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass cf-lift shadow-float rounded-2xl p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Download history</h3>
        <div className="space-y-1">
          {filtered.map((d, i) => {
            const file = files.find(f => f.id === d.fileId)
            const user = userById(d.userId)
            const meta = file ? fileTypeMeta[file.type] : null
            const DeviceIcon = deviceIcon(d.device)
            if (!file || !meta) return null
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/40"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                  <FileText size={15} />
                </div>
                <button
                  onClick={() => { setSelectedFile(file.id); setView('files'); setCurrentFolder(file.folderId) }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{file.path.join(' / ')}</p>
                </button>
                <div className="hidden items-center gap-1.5 md:flex">
                  <Avatar name={user?.name || '?'} size={20} />
                  <span className="text-xs">{user?.name}</span>
                </div>
                <div className="hidden items-center gap-1 text-[10px] text-muted-foreground lg:flex">
                  <DeviceIcon size={12} /> {d.device}
                </div>
                <span className="hidden font-mono text-[10px] text-muted-foreground md:block">{d.ip}</span>
                <span className="hidden text-xs text-muted-foreground sm:block">{fmtBytes(d.size)}</span>
                <span className="hidden text-[10px] text-muted-foreground xl:block">
                  {formatDistanceToNow(new Date(d.timestamp), { addSuffix: true })}
                </span>
                <span className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-medium capitalize',
                  d.status === 'complete' ? 'bg-emerald-500/10 text-emerald-600' :
                  d.status === 'failed' ? 'bg-rose-500/10 text-rose-600' :
                  'bg-amber-500/10 text-amber-600'
                )}>
                  {d.status}
                </span>
                <button
                  onClick={() => toast(`Re-downloading ${file.name}`)}
                  className="rounded-md p-1.5 text-muted-foreground opacity-0 hover:bg-accent hover:text-primary group-hover:opacity-100"
                  title="Download again"
                >
                  <Download size={13} />
                </button>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Download size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium">No downloads yet</p>
              <p className="text-xs text-muted-foreground">Files you download will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
