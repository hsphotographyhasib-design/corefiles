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
  Star, Clock, Trash2, Search as SearchIcon, Filter, Grid2x2, List,
  Download, Share2, RotateCcw, X, MoreHorizontal, File as FileIcon,
  Folder, Calendar, User as UserIcon, HardDrive,
} from 'lucide-react'
import {
  files, folders, userById, fmtBytes, fileTypeMeta, type FileItem,
  departments,
} from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

function FileRow({ file, onOpen }: { file: FileItem; onOpen: () => void }) {
  const owner = userById(file.ownerId)
  const meta = fileTypeMeta[file.type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors hover:border-primary/40"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: meta.bg, color: meta.color }}>
        <FileIcon size={16} />
      </div>
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{file.path.join(' / ') || '—'}</p>
      </button>
      <div className="hidden items-center gap-2 sm:flex">
        <Avatar name={owner?.name || '?'} size={20} />
        <span className="text-xs">{owner?.name}</span>
      </div>
      <span className="hidden text-xs text-muted-foreground md:block">{fmtBytes(file.sizeBytes)}</span>
      <span className="hidden text-xs text-muted-foreground lg:block">{formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</span>
      <div className="flex gap-1">
        <button onClick={() => toast(`Downloading ${file.name}`)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><Download size={13} /></button>
        <button onClick={() => toast('Share dialog opened')} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-primary"><Share2 size={13} /></button>
        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"><MoreHorizontal size={13} /></button>
      </div>
    </motion.div>
  )
}

export function FavoritesView() {
  const { setSelectedFile, setView, setCurrentFolder } = useApp()
  const favorites = files.filter(f => f.starred)

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Star size={18} className="fill-amber-400 text-amber-400" /> Favorites
        </h2>
        <p className="text-xs text-muted-foreground">{favorites.length} starred files across all your workspaces.</p>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {favorites.map(f => (
            <FileRow key={f.id} file={f} onOpen={() => { setSelectedFile(f.id); setView('files'); setCurrentFolder(f.folderId) }} />
          ))}
        </AnimatePresence>
        {favorites.length === 0 && (
          <div className="py-12 text-center">
            <Star size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium">No favorites yet</p>
            <p className="text-xs text-muted-foreground">Star files to find them quickly here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function RecentView() {
  const { setSelectedFile, setView, setCurrentFolder } = useApp()
  const recent = [...files].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 12)

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock size={18} className="text-primary" /> Recent Files
        </h2>
        <p className="text-xs text-muted-foreground">Last 12 files you've worked with.</p>
      </div>

      <div className="space-y-2">
        {recent.map(f => (
          <FileRow key={f.id} file={f} onOpen={() => { setSelectedFile(f.id); setView('files'); setCurrentFolder(f.folderId) }} />
        ))}
      </div>
    </div>
  )
}

export function TrashView() {
  const { toast } = useApp()
  const [items, setItems] = React.useState(files.filter(f => f.folderId === 'f-trash'))

  return (
    <div className="space-y-4">
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Trash2 size={18} className="text-primary" /> Recycle Bin
          </h2>
          <p className="text-xs text-muted-foreground">Files are permanently deleted after 30 days. Restore or empty the bin.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setItems([]); toast('Recycle bin emptied', 'info') }} className="rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
            Empty bin
          </button>
          <button onClick={() => toast('Restore dialog opened')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
            <RotateCcw size={13} /> Restore all
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <Trash2 size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium">Recycle bin is empty</p>
            <p className="text-xs text-muted-foreground">Deleted files will appear here for 30 days.</p>
          </div>
        ) : items.map(f => (
          <motion.div key={f.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <FileIcon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{f.name}</p>
              <p className="text-[10px] text-muted-foreground">Deleted 2 days ago · expires in 28 days</p>
            </div>
            <button onClick={() => { setItems(prev => prev.filter(i => i.id !== f.id)); toast(`${f.name} restored`) }} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs hover:bg-accent">
              <RotateCcw size={12} /> Restore
            </button>
            <button onClick={() => { setItems(prev => prev.filter(i => i.id !== f.id)); toast(`${f.name} permanently deleted`, 'error') }} className="rounded-lg border border-rose-500/30 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30">
              Delete forever
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function SearchView() {
  const { setSelectedFile, setView, setCurrentFolder } = useApp()
  const [query, setQuery] = React.useState('')
  const [deptFilter, setDeptFilter] = React.useState('all')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [dateFilter, setDateFilter] = React.useState('all')

  const results = files.filter(f => {
    if (query && !f.name.toLowerCase().includes(query.toLowerCase()) && !f.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))) return false
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    if (deptFilter !== 'all') {
      const folder = folders.find(fld => fld.id === f.folderId)
      if (folder?.departmentId !== deptFilter) return false
    }
    if (dateFilter !== 'all') {
      const age = Date.now() - new Date(f.updatedAt).getTime()
      if (dateFilter === 'today' && age > 86400000) return false
      if (dateFilter === 'week' && age > 7 * 86400000) return false
      if (dateFilter === 'month' && age > 30 * 86400000) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      <div className="glass shadow-float rounded-2xl p-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <SearchIcon size={18} className="text-primary" /> Global Search
        </h2>
        <p className="text-xs text-muted-foreground">Find files across all departments with powerful filters.</p>
      </div>

      {/* Search bar */}
      <div className="glass shadow-float rounded-2xl p-3">
        <div className="relative mb-3">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by file name, tag, or content…"
            className="h-11 w-full rounded-lg border border-border bg-background/60 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filters:</span>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="h-8 rounded-lg border border-border bg-background/60 px-2 text-xs">
            <option value="all">All departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-8 rounded-lg border border-border bg-background/60 px-2 text-xs">
            <option value="all">All types</option>
            {Object.entries(fileTypeMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="h-8 rounded-lg border border-border bg-background/60 px-2 text-xs">
            <option value="all">Any time</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
          </select>
          <span className="ml-auto rounded-md bg-muted px-2 py-1 text-xs">{results.length} results</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {results.map(f => (
          <FileRow key={f.id} file={f} onOpen={() => { setSelectedFile(f.id); setView('files'); setCurrentFolder(f.folderId) }} />
        ))}
        {results.length === 0 && (
          <div className="py-12 text-center">
            <SearchIcon size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs text-muted-foreground">Try different keywords or adjust filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}
