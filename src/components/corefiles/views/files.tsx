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
  FolderTree, Folder, ChevronRight, ChevronDown, Star, Lock, MoreHorizontal,
  Grid2x2, List, Upload, FolderPlus, Filter, ArrowUpDown, Download, Share2,
  Pencil, Move, Trash2, Copy, Eye, Tag, MessageSquare, QrCode, History,
  Shield, Printer, FileText, RotateCcw, X, Check, FileSpreadsheet, Image as Img,
  Film, Music, Ruler, File as FileIcon, CheckSquare, Square, FolderClosed,
} from 'lucide-react'
import {
  folders, files, userById, fmtBytes, fileTypeMeta, type FileItem, type FolderNode,
} from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ---------------- Folder tree ----------------

function FolderTreeSidebar({ currentId, onSelect }: { currentId: string; onSelect: (id: string) => void }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['f-root', 'f-admin', 'f-proj']))
  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const renderTree = (parentId: string | null, depth = 0) => {
    const children = folders.filter(f => f.parentId === parentId)
    return children.map(folder => {
      const isExpanded = expanded.has(folder.id)
      const isActive = currentId === folder.id
      const Icon = folder.id === 'f-trash' ? (() => <Trash2 size={14} />) :
                   folder.id === 'f-archive' ? (() => <FolderClosed />) :
                   () => <Folder size={14} />
      const childCount = folders.filter(f => f.parentId === folder.id).length
      return (
        <div key={folder.id}>
          <button
            onClick={() => { onSelect(folder.id); if (childCount > 0) toggle(folder.id) }}
            className={cn(
              'group flex w-full items-center gap-1 rounded-lg py-1.5 pr-2 text-left text-xs transition-colors',
              isActive ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent/60'
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {childCount > 0 ? (
              isExpanded ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />
            ) : <span className="w-3" />}
            <span style={{ color: folder.color }} className="grid h-4 w-4 place-items-center"><Folder size={13} /></span>
            <span className="flex-1 truncate">{folder.name}</span>
            {folder.fileCount > 0 && <span className="text-[10px] text-muted-foreground">{folder.fileCount}</span>}
          </button>
          {isExpanded && childCount > 0 && <div>{renderTree(folder.id, depth + 1)}</div>}
        </div>
      )
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FolderTree size={14} /> Folders
        </h3>
      </div>
      <div className="cf-scroll flex-1 overflow-y-auto pr-1">
        {renderTree(null)}
      </div>
    </div>
  )
}

// Need to import FolderClosed properly - moved to top import

// ---------------- File icon ----------------

function FileIconBox({ file, size = 44 }: { file: FileItem; size?: number }) {
  const meta = fileTypeMeta[file.type]
  return (
    <div
      className="grid place-items-center rounded-lg"
      style={{ width: size, height: size, background: meta.bg, color: meta.color }}
    >
      <FileIcon size={size * 0.45} />
    </div>
  )
}

// ---------------- File card ----------------

function FileCard({ file, onOpen, selected, onToggleSelect }: {
  file: FileItem
  onOpen: () => void
  selected: boolean
  onToggleSelect: () => void
}) {
  const owner = userById(file.ownerId)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative cursor-pointer rounded-xl border bg-card/60 p-3 cf-lift-sm hover:border-primary/40',
        selected ? 'border-primary ring-2 ring-primary/20' : 'border-border/60 hover:border-primary/40'
      )}
      onClick={onOpen}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSelect() }}
        className="absolute left-2 top-2 z-10 grid h-5 w-5 place-items-center rounded text-primary opacity-0 transition-opacity group-hover:opacity-100"
      >
        {selected ? <CheckSquare size={16} /> : <Square size={16} className="text-muted-foreground" />}
      </button>

      <div className="mb-3 flex items-start justify-between">
        <FileIconBox file={file} />
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {file.starred && <Star size={14} className="fill-amber-400 text-amber-400" />}
          {file.locked && <Lock size={14} className="text-rose-500" />}
        </div>
      </div>
      <p className="line-clamp-2 text-xs font-semibold leading-snug">{file.name}</p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{fmtBytes(file.sizeBytes)}</span>
        <span>{file.versions.length} v</span>
      </div>
      <div className="mt-2 flex items-center gap-1">
        {file.tags.slice(0, 2).map(t => (
          <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[9px]">#{t}</span>
        ))}
        {file.tags.length > 2 && <span className="text-[9px] text-muted-foreground">+{file.tags.length - 2}</span>}
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-2">
        {owner && <Avatar name={owner.name} size={18} />}
        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</span>
      </div>
    </motion.div>
  )
}

// ---------------- File preview drawer ----------------

function FilePreviewDrawer({ file, onClose }: { file: FileItem; onClose: () => void }) {
  const [tab, setTab] = React.useState<'details' | 'versions' | 'comments' | 'share'>('details')
  const owner = userById(file.ownerId)
  const meta = fileTypeMeta[file.type]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
      className="glass-strong shadow-float fixed right-4 top-20 z-40 flex h-[calc(100vh-6rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl"
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: meta.bg, color: meta.color }}>
            <FileIcon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{file.name}</p>
            <p className="text-[10px] text-muted-foreground">{file.path.join(' / ') || 'Unknown path'}</p>
          </div>
        </div>
        <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
          <X size={16} />
        </button>
      </div>

      {/* Preview surface */}
      <div className="grid h-44 shrink-0 place-items-center border-b border-border/40 bg-gradient-to-br from-muted/40 to-background">
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: meta.bg, color: meta.color }}>
            <FileIcon size={36} />
          </div>
          <p className="text-xs font-medium">{meta.label} · {fmtBytes(file.sizeBytes)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/60 px-2">
        {(['details', 'versions', 'comments', 'share'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'relative px-3 py-2.5 text-xs font-medium capitalize transition-colors',
              tab === t ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
            {tab === t && <motion.div layoutId="drawer-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      <div className="cf-scroll flex-1 overflow-y-auto p-4">
        {tab === 'details' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {file.tags.map(t => (
                <span key={t} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">#{t}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Owner', owner?.name || '—'],
                ['Created', new Date(file.createdAt).toLocaleDateString()],
                ['Modified', new Date(file.updatedAt).toLocaleDateString()],
                ['Size', fmtBytes(file.sizeBytes)],
                ['Type', meta.label],
                ['MIME', file.mimeType],
                ['Versions', String(file.versions.length)],
                ['Comments', String(file.commentCount)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                  <p className="text-[10px] text-muted-foreground">{k}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>
            {file.approvalStatus && (
              <div className={cn(
                'rounded-lg border px-3 py-2 text-xs',
                file.approvalStatus === 'approved' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600' :
                file.approvalStatus === 'pending' ? 'border-amber-500/30 bg-amber-500/5 text-amber-600' :
                'border-rose-500/30 bg-rose-500/5 text-rose-600'
              )}>
                <p className="font-semibold capitalize">{file.approvalStatus} approval</p>
                <p className="mt-0.5 text-[10px] opacity-80">Workflow: Department Head → Manager → Admin</p>
              </div>
            )}
            {file.watermark && (
              <div className="rounded-lg bg-sky-500/5 border border-sky-500/20 px-3 py-2 text-xs">
                <p className="font-semibold text-sky-600">Watermark applied</p>
                <p className="mt-0.5 text-[10px] opacity-80">"Confidential — {owner?.name} — {new Date().toLocaleDateString()}"</p>
              </div>
            )}
          </div>
        )}
        {tab === 'versions' && (
          <div className="space-y-2">
            {file.versions.map(v => (
              <div key={v.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><History size={14} /></span>
                    <div>
                      <p className="text-sm font-semibold">Version {v.version}</p>
                      <p className="text-[10px] text-muted-foreground">{fmtBytes(v.sizeBytes)} · {formatDistanceToNow(new Date(v.uploadedAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <button className="text-xs text-primary hover:underline">Restore</button>
                </div>
                {v.note && <p className="mt-2 rounded bg-muted/40 px-2 py-1 text-[11px] italic">{v.note}</p>}
                <p className="mt-1 text-[10px] text-muted-foreground">SHA-256: {v.checksum}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'comments' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <textarea
                placeholder="Add a comment…"
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => toast('Comment posted')}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:shadow-glow"
            >Post comment</button>
            <div className="space-y-2 pt-2 border-t border-border/40">
              {[
                { user: 'Nurul Ain', text: 'Please verify row 47 — joining date looks off', time: '8h ago' },
                { user: 'Aisyah Putri', text: 'Looks good, but check formatting on tab 3', time: '1d ago' },
              ].map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Avatar name={c.user} size={24} />
                  <div className="flex-1 rounded-lg bg-muted/40 p-2">
                    <p className="text-xs"><span className="font-semibold">{c.user}</span> <span className="text-[10px] text-muted-foreground">· {c.time}</span></p>
                    <p className="mt-0.5 text-[11px]">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'share' && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">Share link</label>
              <div className="flex gap-1">
                <input
                  readOnly
                  value={`https://corefiles.hasanurjaya.com/s/${file.id.slice(0, 8)}-${file.id.slice(-4)}`}
                  className="flex-1 rounded-lg border border-border bg-background/60 px-2 py-1.5 text-xs"
                />
                <button onClick={() => toast('Link copied to clipboard')} className="rounded-lg bg-primary px-2 text-xs text-primary-foreground">
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <p className="text-[10px] text-muted-foreground">Permission</p>
                <p className="font-medium capitalize">{file.sharedWith.length ? 'View + Comment' : 'Private'}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-2 py-1.5">
                <p className="text-[10px] text-muted-foreground">Shared with</p>
                <p className="font-medium">{file.sharedWith.length} users</p>
              </div>
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold flex items-center gap-1.5"><QrCode size={14} /> QR Code</p>
                <button onClick={() => toast('QR code downloaded')} className="text-[10px] text-primary hover:underline">Download</button>
              </div>
              <div className="grid place-items-center py-2">
                {/* Faux QR */}
                <div className="grid h-32 w-32 grid-cols-8 gap-0.5 rounded bg-white p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={(i * 7 + (i % 3)) % 2 === 0 ? 'bg-black' : ''} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="grid grid-cols-4 gap-1 border-t border-border/60 p-2">
        {[
          { icon: Download, label: 'Download', action: () => toast(`Downloading ${file.name}`) },
          { icon: Share2, label: 'Share', action: () => toast('Share dialog opened') },
          { icon: Pencil, label: 'Rename', action: () => toast('Rename mode active') },
          { icon: Printer, label: 'Print', action: () => toast('Sent to printer') },
        ].map(a => (
          <button key={a.label} onClick={a.action} className="flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground">
            <a.icon size={14} />
            {a.label}
          </button>
        ))}
        <button onClick={() => toast('File moved to recycle bin', 'info')} className="flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">
          <Trash2 size={14} /> Delete
        </button>
        <button onClick={() => toast('File locked', 'info')} className="flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30">
          <Lock size={14} /> Lock
        </button>
      </div>
    </motion.div>
  )
}

// ---------------- Main view ----------------

export function FileManagerView() {
  const { currentFolderId, setCurrentFolder, selectedFileId, setSelectedFile, toast } = useApp()
  const [view, setView] = React.useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = React.useState<'name' | 'date' | 'size'>('date')
  const [filterType, setFilterType] = React.useState<string>('all')
  const [showFilters, setShowFilters] = React.useState(false)

  const currentFolder = folders.find(f => f.id === currentFolderId) || folders[0]
  const subFolders = folders.filter(f => f.parentId === currentFolderId)
  const folderFiles = files.filter(f => f.folderId === currentFolderId)
    .filter(f => filterType === 'all' || f.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'size') return b.sizeBytes - a.sizeBytes
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const selectedFile = selectedFileId ? files.find(f => f.id === selectedFileId) : null

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  return (
    <div className="flex gap-4">
      {/* Tree sidebar */}
      <aside className="glass shadow-float hidden h-[calc(100vh-8rem)] w-64 shrink-0 rounded-2xl p-2 lg:block">
        <FolderTreeSidebar
          currentId={currentFolderId}
          onSelect={(id) => { setCurrentFolder(id); setSelectedIds(new Set()); setSelectedFile(null) }}
        />
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="glass shadow-float mb-4 rounded-2xl p-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Breadcrumb */}
            <div className="flex min-w-0 flex-1 items-center gap-1 text-sm">
              <button onClick={() => setCurrentFolder('f-root')} className="text-muted-foreground hover:text-foreground">Hasanur Jaya</button>
              {currentFolder.id !== 'f-root' && (
                <>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                  <span className="truncate font-semibold">{currentFolder.name}</span>
                </>
              )}
            </div>

            {/* Actions */}
            <button onClick={() => { useApp.getState().setView('upload'); useApp.getState().setBreadcrumbs([{ label: 'Upload Files', view: 'upload' }]) }} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:shadow-glow">
              <Upload size={13} /> Upload
            </button>
            <button onClick={() => toast('New folder created')} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent">
              <FolderPlus size={13} /> New Folder
            </button>
            <div className="flex rounded-lg border border-border p-0.5">
              <button onClick={() => setView('grid')} className={cn('grid h-7 w-7 place-items-center rounded-md', view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                <Grid2x2 size={13} />
              </button>
              <button onClick={() => setView('list')} className={cn('grid h-7 w-7 place-items-center rounded-md', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}>
                <List size={13} />
              </button>
            </div>
            <button onClick={() => setShowFilters(s => !s)} className={cn('flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs', showFilters ? 'bg-accent' : 'hover:bg-accent')}>
              <Filter size={13} /> Filter
            </button>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground">Type:</span>
                  {['all', 'pdf', 'word', 'excel', 'image', 'video', 'dwg'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={cn(
                        'rounded-md px-2 py-1 text-[11px] capitalize transition-colors',
                        filterType === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                  <span className="ml-3 text-xs text-muted-foreground">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-[11px]"
                  >
                    <option value="date">Last modified</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="size">Size (largest)</option>
                  </select>
                  <ArrowUpDown size={12} className="text-muted-foreground" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk action bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2"
              >
                <span className="text-xs font-medium text-primary">{selectedIds.size} selected</span>
                <div className="ml-auto flex gap-1">
                  {[
                    { icon: Download, label: 'Download', action: () => toast(`Downloading ${selectedIds.size} files`) },
                    { icon: Move, label: 'Move', action: () => toast('Move dialog opened') },
                    { icon: Tag, label: 'Tag', action: () => toast('Tag dialog opened') },
                    { icon: Share2, label: 'Share', action: () => toast('Bulk share link created') },
                    { icon: Trash2, label: 'Delete', action: () => { toast(`${selectedIds.size} files moved to recycle bin`, 'info'); setSelectedIds(new Set()) } },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-accent">
                      <a.icon size={12} /> <span className="hidden sm:inline">{a.label}</span>
                    </button>
                  ))}
                  <button onClick={() => setSelectedIds(new Set())} className="rounded-md p-1.5 hover:bg-accent">
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subfolders */}
        {subFolders.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subfolders</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {subFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setCurrentFolder(f.id); setSelectedIds(new Set()) }}
                  className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-3 text-left cf-lift-sm hover:border-primary/40"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${f.color}20`, color: f.color }}>
                    <Folder size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.fileCount} files</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {folderFiles.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
            <Folder size={36} className="mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium">No files in this folder</p>
            <p className="text-xs text-muted-foreground">Drag & drop or click Upload to add files</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <AnimatePresence>
              {folderFiles.map(f => (
                <FileCard
                  key={f.id}
                  file={f}
                  selected={selectedIds.has(f.id)}
                  onToggleSelect={() => toggleSelect(f.id)}
                  onOpen={() => setSelectedFile(f.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="hidden px-3 py-2 text-left md:table-cell">Owner</th>
                  <th className="hidden px-3 py-2 text-left sm:table-cell">Size</th>
                  <th className="hidden px-3 py-2 text-left sm:table-cell">Modified</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {folderFiles.map(f => (
                  <tr key={f.id} className="border-t border-border/40 hover:bg-accent/40">
                    <td className="px-3 py-2">
                      <button onClick={() => setSelectedFile(f.id)} className="flex items-center gap-2 text-left">
                        <FileIconBox file={f} size={28} />
                        <div>
                          <p className="text-xs font-medium">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground">{f.tags.join(', ')}</p>
                        </div>
                      </button>
                    </td>
                    <td className="hidden px-3 py-2 md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={userById(f.ownerId)?.name || '?'} size={20} />
                        <span className="text-xs">{userById(f.ownerId)?.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2 text-xs sm:table-cell">{fmtBytes(f.sizeBytes)}</td>
                    <td className="hidden px-3 py-2 text-xs text-muted-foreground sm:table-cell">{formatDistanceToNow(new Date(f.updatedAt), { addSuffix: true })}</td>
                    <td className="px-3 py-2 text-right">
                      <button className="rounded-md p-1 hover:bg-accent"><MoreHorizontal size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File preview drawer */}
      <AnimatePresence>
        {selectedFile && <FilePreviewDrawer file={selectedFile} onClose={() => setSelectedFile(null)} />}
      </AnimatePresence>
    </div>
  )
}
