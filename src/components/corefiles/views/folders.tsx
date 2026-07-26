'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Folder, FolderOpen, ChevronRight, ChevronDown, FolderTree, HardDrive,
  Users as UsersIcon, Search, MoreHorizontal, Plus, Building2,
} from 'lucide-react'
import { folders, departments, files, fmtBytes, userById } from '@/components/corefiles/data/mock'
import { useApp } from '@/lib/corefiles/store'
import { Avatar } from '@/components/corefiles/common/avatar'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

/**
 * FoldersView — folder-centric navigation.
 * Distinct from Files: shows a folder tree explorer + folder size analytics,
 * not a file grid. Useful for org-chart-style browsing of the workspace.
 */
export function FoldersView() {
  const { setCurrentFolder, setView, setSelectedFile, setBreadcrumbs, toast: _t } = useApp()
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(['f-root', 'f-admin', 'f-proj']))
  const [query, setQuery] = React.useState('')

  const toggle = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const filtered = React.useMemo(() => {
    if (!query.trim()) return folders
    const q = query.toLowerCase()
    return folders.filter(f => f.name.toLowerCase().includes(q))
  }, [query])

  const childrenOf = (parentId: string | null) =>
    filtered.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name))

  const totalSize = folders.reduce((s, f) => s + f.sizeBytes, 0)
  const totalFiles = folders.reduce((s, f) => s + f.fileCount, 0)

  const renderTree = (parentId: string | null, depth = 0) => {
    const children = childrenOf(parentId)
    if (children.length === 0) return null
    return children.map(folder => {
      const isExpanded = expanded.has(folder.id)
      const hasChildren = folders.some(f => f.parentId === folder.id)
      const dept = folder.departmentId ? departments.find(d => d.id === folder.departmentId) : null
      const owner = userById(folder.createdBy)
      return (
        <motion.div
          key={folder.id}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="group flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-accent/40"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
          >
            <button
              onClick={() => hasChildren && toggle(folder.id)}
              className="grid h-5 w-5 place-items-center text-muted-foreground"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}
            </button>
            <button
              onClick={() => {
                setCurrentFolder(folder.id)
                setView('files')
                setBreadcrumbs([
                  { label: 'Folders', view: 'folders' },
                  { label: folder.name, view: 'files', folderId: folder.id },
                ])
              }}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{ background: `${folder.color || '#10b981'}20`, color: folder.color || '#10b981' }}
              aria-label={`Open ${folder.name}`}
            >
              {isExpanded ? <FolderOpen size={15} /> : <Folder size={15} />}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{folder.name}</p>
                {dept && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                    {dept.name}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {folder.fileCount} files · {fmtBytes(folder.sizeBytes)} · created by {owner?.name || 'System'} {formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}
              </p>
            </div>
            <button
              onClick={() => toast(`Renaming ${folder.name}`)}
              className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
              aria-label="More actions"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
          {isExpanded && hasChildren && <div>{renderTree(folder.id, depth + 1)}</div>}
        </motion.div>
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass cf-lift shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FolderTree size={18} className="text-primary" /> Folders
          </h2>
          <p className="text-xs text-muted-foreground">
            Browse the company folder tree · {folders.length} folders · {totalFiles} files · {fmtBytes(totalSize)} total
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search folders…"
              className="h-9 w-48 rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button onClick={() => toast('New folder dialog opened')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
            <Plus size={13} /> New Folder
          </button>
        </div>
      </div>

      {/* Stats by department */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {departments.slice(0, 4).map(d => {
          const folderCount = folders.filter(f => f.departmentId === d.id).length
          return (
            <div key={d.id} className="glass cf-lift-sm shadow-float rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${d.color}20`, color: d.color }}>
                  <Building2 size={18} />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{d.name}</p>
                  <p className="text-lg font-bold">{folderCount} folders</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tree */}
      <div className="glass cf-lift shadow-float rounded-2xl p-3">
        <div className="mb-2 flex items-center justify-between border-b border-border/60 px-2 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Folder Tree</h3>
          <button
            onClick={() => { setExpanded(new Set(folders.map(f => f.id))) }}
            className="text-xs text-primary hover:underline"
          >
            Expand all
          </button>
        </div>
        <div className="cf-scroll max-h-[60vh] overflow-y-auto">
          {renderTree(null)}
          {filtered.length === 0 && (
            <div className="py-8 text-center">
              <Folder size={28} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm font-medium">No folders match "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
