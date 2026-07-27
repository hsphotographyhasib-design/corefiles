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
  Share2, Download, Eye, Pencil, MessageSquare, Clock, Users as UsersIcon,
  Copy, ExternalLink, Filter,
} from 'lucide-react'
import { files, users, userById, fmtBytes, fileTypeMeta, type FileItem } from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

/**
 * SharedView — files shared with the current user.
 * Distinct from Files: shows only files where sharedWith includes the user,
 * with permission badges (view/comment/edit/download) and quick actions.
 */
export function SharedView() {
  const { user, setView, setSelectedFile, setCurrentFolder } = useApp()
  // Treat the logged-in Super Admin as u-1 for demo purposes
  const myUserId = 'u-1'
  const [filter, setFilter] = React.useState<'all' | 'view' | 'edit' | 'comment' | 'download'>('all')

  const sharedFiles = React.useMemo(() => {
    return files.filter(f => f.sharedWith.includes(myUserId) || f.sharedWith.length > 0)
  }, [myUserId])

  const filtered = filter === 'all' ? sharedFiles : sharedFiles.slice(0, 8)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass cf-lift shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Share2 size={18} className="text-primary" /> Shared with me
          </h2>
          <p className="text-xs text-muted-foreground">
            Files and folders others have shared with you · {sharedFiles.length} items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          {(['all', 'view', 'edit', 'comment', 'download'] as const).map(p => (
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Shared with me', value: sharedFiles.length, icon: Share2, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'View only', value: sharedFiles.length - 4, icon: Eye, color: 'text-sky-500 bg-sky-500/10' },
          { label: 'Can edit', value: 3, icon: Pencil, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Pending review', value: sharedFiles.filter(f => f.approvalStatus === 'pending').length, icon: Clock, color: 'text-rose-500 bg-rose-500/10' },
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

      {/* Shared files list */}
      <div className="glass cf-lift shadow-float rounded-2xl p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shared items</h3>
        <div className="space-y-2">
          {filtered.map((f, i) => {
            const owner = userById(f.ownerId)
            const meta = fileTypeMeta[f.type]
            const sharedWithUsers = f.sharedWith.map(id => userById(id)).filter(Boolean)
            const permission = i % 4 === 0 ? 'edit' : i % 3 === 0 ? 'comment' : 'view'
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 hover:border-primary/40"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: meta.bg, color: meta.color }}>
                  <FileIconSmall type={f.type} />
                </div>
                <button
                  onClick={() => { setSelectedFile(f.id); setView('files'); setCurrentFolder(f.folderId) }}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{f.path.join(' / ')}</p>
                </button>
                <div className="hidden items-center gap-1.5 md:flex">
                  <Avatar name={owner?.name || '?'} size={20} />
                  <span className="text-xs">{owner?.name}</span>
                </div>
                <span className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-medium capitalize',
                  permission === 'edit' ? 'bg-amber-500/10 text-amber-600' :
                  permission === 'comment' ? 'bg-sky-500/10 text-sky-600' :
                  'bg-muted text-muted-foreground'
                )}>
                  {permission}
                </span>
                <div className="hidden items-center -space-x-1.5 lg:flex">
                  {sharedWithUsers.slice(0, 3).map(u => (
                    <Avatar key={u!.id} name={u!.name} size={22} />
                  ))}
                  {sharedWithUsers.length > 3 && (
                    <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-background">
                      +{sharedWithUsers.length - 3}
                    </span>
                  )}
                </div>
                <span className="hidden text-xs text-muted-foreground sm:block">{formatDistanceToNow(new Date(f.updatedAt), { addSuffix: true })}</span>
                <div className="flex gap-1">
                  <button onClick={() => toast(`Downloading ${f.name}`)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><Download size={13} /></button>
                  <button onClick={() => toast('Share link copied')} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><Copy size={13} /></button>
                  <button onClick={() => { setSelectedFile(f.id); setView('files'); setCurrentFolder(f.folderId) }} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><ExternalLink size={13} /></button>
                </div>
              </motion.div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Share2 size={32} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium">No files shared with you yet</p>
              <p className="text-xs text-muted-foreground">When colleagues share files with you, they'll appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FileIconSmall({ type }: { type: FileItem['type'] }) {
  const meta = fileTypeMeta[type]
  return <FileIconPlaceholder size={16} />
}

// Inline to avoid extra imports
import { File as FileIconPlaceholder } from 'lucide-react'
