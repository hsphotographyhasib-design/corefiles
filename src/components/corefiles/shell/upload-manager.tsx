'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, X, ChevronDown, ChevronUp, Pause, Play, RotateCw, Trash2,
  CheckCircle2, AlertCircle, File as FileIcon, Loader2, Clock,
  ShieldCheck, AlertTriangle, Layers,
} from 'lucide-react'
import { useUploadEngine, type UploadItem, type UploadStatus } from '@/lib/corefiles/upload-engine'
import { useApp } from '@/lib/corefiles/store'
import { getFileConfig, formatBytes, formatSpeed, formatEta } from '@/lib/corefiles/upload-validation'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const statusMeta: Record<UploadStatus, { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  queued: { label: 'Queued', color: 'text-muted-foreground', icon: Clock },
  validating: { label: 'Validating', color: 'text-sky-500', icon: Loader2 },
  pending_conflict: { label: 'Conflict', color: 'text-amber-500', icon: AlertTriangle },
  init: { label: 'Initializing', color: 'text-sky-500', icon: Loader2 },
  uploading: { label: 'Uploading', color: 'text-primary', icon: Upload },
  paused: { label: 'Paused', color: 'text-amber-500', icon: Pause },
  chunk_failed: { label: 'Retrying', color: 'text-amber-500', icon: RotateCw },
  scanning: { label: 'Scanning', color: 'text-violet-500', icon: ShieldCheck },
  completing: { label: 'Finalizing', color: 'text-sky-500', icon: Loader2 },
  completed: { label: 'Done', color: 'text-emerald-500', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-rose-500', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', icon: X },
}

function UploadRow({ item, onResolveConflict }: { item: UploadItem; onResolveConflict: () => void }) {
  const { pauseItem, resumeItem, cancelItem, retryItem, removeItem } = useUploadEngine()
  const cfg = getFileConfig(item.name)
  const meta = statusMeta[item.status]
  const StatusIcon = meta.icon
  const isSpinning = ['validating', 'init', 'uploading', 'scanning', 'completing', 'chunk_failed'].includes(item.status)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl border border-border/60 bg-card/40 p-3"
    >
      <div className="flex items-start gap-2.5">
        {/* File icon */}
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
          style={{ background: cfg ? `${cfg.color}20` : 'var(--muted)', color: cfg?.color || 'var(--muted-foreground)' }}
        >
          <FileIcon size={15} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-xs font-medium" title={item.originalName}>{item.name}</p>
            <span className={cn('flex shrink-0 items-center gap-1 text-[10px] font-medium', meta.color)}>
              <StatusIcon size={11} className={isSpinning ? 'animate-spin' : ''} />
              {meta.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {formatBytes(item.size)} · {item.folderName}
          </p>

          {/* Progress bar */}
          {item.status !== 'pending_conflict' && item.status !== 'failed' && item.status !== 'cancelled' && (
            <div className="mt-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    item.status === 'completed' ? 'bg-emerald-500' :
                    item.status === 'paused' ? 'bg-amber-500' :
                    item.status === 'failed' ? 'bg-rose-500' :
                    'bg-primary'
                  )}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
                <span>{Math.round(item.progress)}%</span>
                {item.status === 'uploading' && (
                  <span>
                    {formatSpeed(item.speed)}
                    {item.eta > 0 && ` · ${formatEta(item.eta)} left`}
                  </span>
                )}
                {item.status === 'completed' && item.completedAt && (
                  <span>{formatDistanceToNow(new Date(item.completedAt), { addSuffix: true })}</span>
                )}
              </div>
            </div>
          )}

          {/* Chunk visualization (collapsed) */}
          {item.status === 'uploading' && item.chunks.length > 1 && (
            <div className="mt-1.5 flex gap-0.5">
              {item.chunks.map(c => (
                <div
                  key={c.index}
                  className={cn(
                    'h-1 flex-1 rounded-full',
                    c.status === 'done' ? 'bg-emerald-500' :
                    c.status === 'uploading' ? 'bg-primary' :
                    c.status === 'failed' ? 'bg-rose-500' :
                    'bg-muted'
                  )}
                />
              ))}
            </div>
          )}

          {/* Conflict banner */}
          {item.status === 'pending_conflict' && (
            <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
              <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                ⚠ A file with the same name or checksum already exists.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                <button onClick={onResolveConflict} className="rounded-md bg-amber-500 px-2 py-1 text-[9px] font-medium text-white hover:bg-amber-600">
                  Resolve
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {item.error && item.status === 'failed' && (
            <p className="mt-1 rounded-md bg-rose-500/10 px-2 py-1 text-[10px] text-rose-600">{item.error}</p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-2 flex justify-end gap-1 border-t border-border/40 pt-2">
        {item.status === 'uploading' && (
          <button onClick={() => pauseItem(item.id)} className="rounded-md p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30" title="Pause">
            <Pause size={12} />
          </button>
        )}
        {item.status === 'paused' && (
          <button onClick={() => resumeItem(item.id)} className="rounded-md p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" title="Resume">
            <Play size={12} />
          </button>
        )}
        {['failed', 'cancelled', 'chunk_failed'].includes(item.status) && (
          <button onClick={() => retryItem(item.id)} className="rounded-md p-1.5 text-primary hover:bg-accent" title="Retry">
            <RotateCw size={12} />
          </button>
        )}
        {['uploading', 'paused', 'queued', 'validating', 'init', 'chunk_failed'].includes(item.status) && (
          <button onClick={() => cancelItem(item.id)} className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Cancel">
            <X size={12} />
          </button>
        )}
        {['completed', 'failed', 'cancelled'].includes(item.status) && (
          <button onClick={() => removeItem(item.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="Remove from list">
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function UploadManager() {
  const {
    items, isManagerOpen, setManagerOpen, clearCompleted,
    activeCount, completedCount, failedCount, queuedCount,
    overallProgress, totalSpeed,
  } = useUploadEngine()
  const { setView } = useApp()
  const [expanded, setExpanded] = React.useState(true)
  const [conflictItem, setConflictItem] = React.useState<UploadItem | null>(null)

  const hasItems = items.length > 0
  const active = activeCount()
  const overall = overallProgress()

  // Auto-open manager when items arrive
  React.useEffect(() => {
    if (hasItems && !isManagerOpen) setManagerOpen(true)
  }, [hasItems, isManagerOpen, setManagerOpen])

  // Listen for upload completion events (for notifications + audit log)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      useApp.getState().toast(`✓ ${detail.item.name} uploaded successfully`)
      // Add notification via store set()
      useApp.setState(s => ({
        notifications: [{
          id: `n-upload-${Date.now()}`,
          type: 'file_uploaded' as const,
          title: 'Upload completed',
          description: `${detail.item.name} (${formatBytes(detail.item.size)})`,
          timestamp: new Date().toISOString(),
          read: false,
          severity: 'success' as const,
          actorId: 'u-1',
        }, ...s.notifications],
      }))
    }
    window.addEventListener('cf-upload-complete', handler)
    return () => window.removeEventListener('cf-upload-complete', handler)
  }, [])

  if (!isManagerOpen || !hasItems) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="glass-nav fixed bottom-5 right-5 z-40 flex max-h-[70vh] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Upload size={16} className="text-primary" />
              {active > 0 && (
                <span className="absolute -right-1 -top-1 grid h-3 min-w-3 place-items-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                  {active}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold">Upload Manager</h3>
              <p className="text-[10px] text-muted-foreground">
                {active > 0 ? `${active} uploading · ${queuedCount()} queued` :
                  completedCount() > 0 ? `${completedCount()} completed` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(e => !e)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
            <button
              onClick={() => setManagerOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Minimize"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Overall progress strip */}
        <AnimatePresence>
          {expanded && active > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border/40 bg-muted/30 px-4 py-2.5"
            >
              <div className="flex items-center justify-between text-[10px] font-medium">
                <span className="text-muted-foreground">Overall progress</span>
                <span>{Math.round(overall)}% · {formatSpeed(totalSpeed())}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                  animate={{ width: `${overall}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="cf-scroll flex-1 overflow-y-auto p-3"
            >
              <div className="space-y-2">
                <AnimatePresence>
                  {items.map(item => (
                    <UploadRow
                      key={item.id}
                      item={item}
                      onResolveConflict={() => setConflictItem(item)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/30 px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-500" />
              {completedCount()} done
            </span>
            {failedCount() > 0 && (
              <span className="flex items-center gap-1">
                <AlertCircle size={10} className="text-rose-500" />
                {failedCount()} failed
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers size={10} />
              {items.length} total
            </span>
          </div>
          <div className="flex gap-1">
            {completedCount() + failedCount() > 0 && (
              <button onClick={clearCompleted} className="rounded-md px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground">
                Clear done
              </button>
            )}
            <button
              onClick={() => setView('downloads')}
              className="rounded-md px-2 py-1 text-[10px] text-primary hover:bg-accent"
            >
              History →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Conflict resolution dialog */}
      <ConflictDialog
        item={conflictItem}
        onClose={() => setConflictItem(null)}
      />
    </AnimatePresence>
  )
}

// ----------------------------- Conflict dialog -----------------------------

function ConflictDialog({ item, onClose }: { item: UploadItem | null; onClose: () => void }) {
  const { setConflictResolution } = useUploadEngine()
  if (!item) return null

  const options: { value: 'replace' | 'keep_both' | 'new_version' | 'skip'; title: string; desc: string; icon: React.ComponentType<{ size?: number }>; color: string }[] = [
    { value: 'replace', title: 'Replace', desc: 'Overwrite the existing file (previous versions preserved in history)', icon: RotateCw, color: 'text-amber-500' },
    { value: 'keep_both', title: 'Keep both', desc: 'Rename the new file (e.g. "file (1).pdf")', icon: Layers, color: 'text-sky-500' },
    { value: 'new_version', title: 'Create new version', desc: 'Add as a new version of the existing file', icon: CheckCircle2, color: 'text-emerald-500' },
    { value: 'skip', title: 'Skip', desc: 'Don\'t upload this file', icon: X, color: 'text-muted-foreground' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="glass-nav w-full max-w-md overflow-hidden rounded-3xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="border-b border-border/60 px-5 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle size={16} className="text-amber-500" /> File conflict
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              A file named <span className="font-semibold text-foreground">{item.name}</span> already exists in this folder. What would you like to do?
            </p>
          </div>
          <div className="space-y-1 p-3">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === 'skip') {
                    useUploadEngine.getState().cancelItem(item.id)
                  } else {
                    setConflictResolution(item.id, opt.value)
                  }
                  onClose()
                }}
                className="flex w-full items-start gap-3 rounded-xl border border-border/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent/40"
              >
                <opt.icon size={16} className={opt.color + ' mt-0.5 shrink-0'} />
                <div>
                  <p className="text-sm font-medium">{opt.title}</p>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
