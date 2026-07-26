'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FolderUp, File as FileIcon, X, Check, Loader2, Pause, Play } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { cn } from '@/lib/utils'

type UploadState = 'queued' | 'uploading' | 'paused' | 'done' | 'error'
interface UploadItem { id: string; name: string; size: number; progress: number; state: UploadState; speed: string }

const mockFiles: UploadItem[] = [
  { id: 'up-1', name: 'Foundation Design Report v6.pdf', size: 8_900_000, progress: 0, state: 'queued', speed: '0 MB/s' },
  { id: 'up-2', name: 'Tower A — Single Line Diagram.pdf', size: 5_400_000, progress: 0, state: 'queued', speed: '0 MB/s' },
  { id: 'up-3', name: 'Q3 Financial Statement.xlsx', size: 2_300_000, progress: 0, state: 'queued', speed: '0 MB/s' },
]

export function UploadModal() {
  const { uploadOpen, setUploadOpen, toast } = useApp()
  const [items, setItems] = React.useState<UploadItem[]>([])
  const [dragOver, setDragOver] = React.useState(false)

  React.useEffect(() => {
    if (uploadOpen && items.length === 0) {
      // Seed a couple of in-progress uploads for demo
      setItems(mockFiles.map((f, i) => ({ ...f, progress: i === 0 ? 64 : 0, state: i === 0 ? 'uploading' : 'queued', speed: '12.4 MB/s' })))
    }
  }, [uploadOpen])

  // Simulate upload progress
  React.useEffect(() => {
    if (!uploadOpen) return
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => {
        if (item.state === 'uploading' && item.progress < 100) {
          const next = Math.min(100, item.progress + Math.random() * 8)
          return { ...item, progress: next, state: next >= 100 ? 'done' : 'uploading', speed: next >= 100 ? '0 MB/s' : `${(8 + Math.random() * 8).toFixed(1)} MB/s` }
        }
        return item
      }))
    }, 700)
    return () => clearInterval(interval)
  }, [uploadOpen])

  const addFile = (name: string, size: number) => {
    setItems(prev => [...prev, { id: `up-${Date.now()}`, name, size, progress: 0, state: 'uploading', speed: '11.2 MB/s' }])
    toast(`Uploading ${name}…`)
  }

  const togglePause = (id: string) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, state: i.state === 'paused' ? 'uploading' : 'paused' } : i))
  const cancel = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  const totalProgress = items.length ? items.reduce((s, i) => s + i.progress, 0) / items.length : 0

  return (
    <AnimatePresence>
      {uploadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setUploadOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="glass-strong shadow-float w-full max-w-2xl overflow-hidden rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <UploadCloud size={18} className="text-primary" /> Quick Upload
                </h2>
                <p className="text-xs text-muted-foreground">Chunked · resumable · ClamAV-scanned</p>
              </div>
              <button onClick={() => setUploadOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(false)
                  const dropped = e.dataTransfer.files
                  Array.from(dropped).forEach(f => addFile(f.name, f.size))
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-center transition-colors',
                  dragOver ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <UploadCloud size={32} className="text-primary" />
                <p className="text-sm font-medium">Drag & drop files here</p>
                <p className="text-xs text-muted-foreground">or</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => addFile('Handover Notes.pdf', 1_200_000)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:shadow-glow"
                  >
                    <FileIcon size={12} /> Browse Files
                  </button>
                  <button
                    onClick={() => addFile('Site Photos Folder', 184_000_000)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                  >
                    <FolderUp size={12} /> Folder Upload
                  </button>
                </div>
              </div>

              {/* Upload queue */}
              {items.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''} · {items.filter(i => i.state === 'done').length} done</span>
                    <span className="font-medium">{Math.round(totalProgress)}% overall</span>
                  </div>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="rounded-xl border border-border/60 bg-card/60 p-3">
                        <div className="mb-1.5 flex items-center gap-2">
                          <FileIcon size={14} className="shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate text-xs font-medium">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">{(item.size / 1_000_000).toFixed(1)} MB</span>
                          {item.state === 'done' ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : item.state === 'uploading' ? (
                            <button onClick={() => togglePause(item.id)} className="text-amber-500 hover:text-amber-600"><Pause size={13} /></button>
                          ) : item.state === 'paused' ? (
                            <button onClick={() => togglePause(item.id)} className="text-emerald-500 hover:text-emerald-600"><Play size={13} /></button>
                          ) : (
                            <Loader2 size={13} className="text-muted-foreground animate-spin" />
                          )}
                          <button onClick={() => cancel(item.id)} className="text-muted-foreground hover:text-rose-500"><X size={13} /></button>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className={cn('h-full rounded-full', item.state === 'done' ? 'bg-emerald-500' : 'bg-primary')}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{Math.round(item.progress)}%</span>
                          <span>{item.state === 'uploading' ? item.speed : item.state === 'done' ? 'Complete' : item.state}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                <span>🔒 Files are encrypted at rest (AES-256) and scanned by ClamAV</span>
                <span>Max 5 GB per file</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
