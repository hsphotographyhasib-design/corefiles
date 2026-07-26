'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, FolderTree, Users, Settings, Shield, BarChart3, Server,
  FileText, Building2, Bell, Star, Clock, Trash2, Boxes, CornerDownLeft,
} from 'lucide-react'
import { useApp, type ViewKey } from '@/lib/corefiles/store'
import { files, users, folders } from '@/components/corefiles/data/mock'
import { cn } from '@/lib/utils'
import { fmtBytes, fileTypeMeta } from '@/components/corefiles/data/mock'

type Result = {
  id: string
  type: 'view' | 'file' | 'folder' | 'user'
  label: string
  sub: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  action: () => void
}

export function QuickFind() {
  const { quickFindOpen, setQuickFind, setView, setCurrentFolder, setSelectedFile } = useApp()
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (quickFindOpen) {
      setQuery('')
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [quickFindOpen])

  const results = React.useMemo<Result[]>(() => {
    const navResults: Result[] = [
      { id: 'n-dash', type: 'view', label: 'Dashboard', sub: 'Overview & system health', icon: Boxes, action: () => setView('dashboard') },
      { id: 'n-files', type: 'view', label: 'File Manager', sub: 'Browse all files', icon: FolderTree, action: () => setView('files') },
      { id: 'n-fav', type: 'view', label: 'Favorites', sub: 'Starred files', icon: Star, action: () => setView('favorites') },
      { id: 'n-rec', type: 'view', label: 'Recent Files', sub: 'Recently modified', icon: Clock, action: () => setView('recent') },
      { id: 'n-users', type: 'view', label: 'Users', sub: 'Manage user accounts', icon: Users, action: () => setView('users') },
      { id: 'n-roles', type: 'view', label: 'Roles & Permissions', sub: 'Configure access control', icon: Shield, action: () => setView('roles') },
      { id: 'n-dept', type: 'view', label: 'Departments', sub: 'Organization structure', icon: Building2, action: () => setView('departments') },
      { id: 'n-audit', type: 'view', label: 'Audit Logs', sub: 'Immutable action trail', icon: FileText, action: () => setView('audit-logs') },
      { id: 'n-mon', type: 'view', label: 'Server Monitoring', sub: 'Live system metrics', icon: Server, action: () => setView('monitoring') },
      { id: 'n-rep', type: 'view', label: 'Reports', sub: 'Analytics & exports', icon: BarChart3, action: () => setView('reports') },
      { id: 'n-set', type: 'view', label: 'Settings', sub: 'System preferences', icon: Settings, action: () => setView('settings') },
      { id: 'n-trash', type: 'view', label: 'Recycle Bin', sub: 'Deleted files', icon: Trash2, action: () => setView('trash') },
      { id: 'n-notif', type: 'view', label: 'Notifications', sub: 'Alerts center', icon: Bell, action: () => setView('notifications') },
    ]
    const fileResults: Result[] = files.slice(0, 12).map(f => ({
      id: f.id,
      type: 'file',
      label: f.name,
      sub: `${f.path.join(' / ')} · ${fmtBytes(f.sizeBytes)}`,
      icon: Search,
      action: () => { setView('files'); setSelectedFile(f.id); setCurrentFolder(f.folderId) },
    }))
    const folderResults: Result[] = folders.slice(0, 12).map(f => ({
      id: f.id,
      type: 'folder',
      label: f.name,
      sub: 'Folder · ' + f.fileCount + ' files',
      icon: FolderTree,
      action: () => { setView('files'); setCurrentFolder(f.id) },
    }))
    const userResults: Result[] = users.slice(0, 12).map(u => ({
      id: u.id,
      type: 'user',
      label: u.name,
      sub: `${u.role} · ${u.email}`,
      icon: Users,
      action: () => setView('users'),
    }))
    const all = [...navResults, ...fileResults, ...folderResults, ...userResults]
    if (!query.trim()) return all.slice(0, 8)
    const q = query.toLowerCase()
    return all.filter(r => r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)).slice(0, 12)
  }, [query, setView, setSelectedFile, setCurrentFolder])

  React.useEffect(() => { setActive(0) }, [query])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); results[active].action(); setQuickFind(false) }
    else if (e.key === 'Escape') setQuickFind(false)
  }

  return (
    <AnimatePresence>
      {quickFindOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm p-4 pt-[15vh]"
          onClick={() => setQuickFind(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="glass-strong shadow-float w-full max-w-2xl overflow-hidden rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
              <Search size={18} className="text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Search files, folders, people, or jump to any view…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <kbd>ESC</kbd>
            </div>
            <div className="cf-scroll max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No results for "{query}"</div>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => { r.action(); setQuickFind(false) }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                    active === i ? 'bg-accent' : 'hover:bg-accent/60'
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <r.icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.sub}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{r.type}</span>
                    {active === i && <CornerDownLeft size={14} className="text-muted-foreground" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd>↵</kbd> Select</span>
              </div>
              <span>Powered by CoreFiles Search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
