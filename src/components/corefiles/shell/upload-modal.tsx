'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FolderUp, File as FileIcon, X, Check, ClipboardPaste,
  Camera, Image as ImageIcon, Folder, ChevronDown, ChevronRight,
  ShieldCheck, FileText, Film, Music, Archive, Ruler, Code, FileSpreadsheet,
  HardDrive, Layers, Zap, ScanLine, Brain,
} from 'lucide-react'
import { useUploadEngine } from '@/lib/corefiles/upload-engine'
import { useApp } from '@/lib/corefiles/store'
import { folders, departments, fmtBytes } from '@/components/corefiles/data/mock'
import { getFileConfig, formatBytes, FILE_TYPES } from '@/lib/corefiles/upload-validation'
import { cn } from '@/lib/utils'

const categoryIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  image: ImageIcon,
  video: Film,
  audio: Music,
  document: FileText,
  archive: Archive,
  cad: Ruler,
  data: FileSpreadsheet,
  text: FileText,
  code: Code,
}

export function UploadModal() {
  const { isModalOpen, setModalOpen, destinationFolderId, setDestination, addFiles, addFolder } = useUploadEngine()
  const [dragOver, setDragOver] = React.useState(false)
  const [showDestinations, setShowDestinations] = React.useState(false)
  const [recentPastes, setRecentPastes] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const folderInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  // Paste handler — listen globally when modal is open
  React.useEffect(() => {
    if (!isModalOpen) return
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || [])
      if (files.length > 0) {
        addFiles(files)
        setRecentPastes(p => [`${files[0].name} (${formatBytes(files[0].size)})`, ...p].slice(0, 3))
      }
      // Pasted image from clipboard (some browsers)
      const items = e.clipboardData?.items
      if (items) {
        for (const it of items) {
          if (it.type.startsWith('image/')) {
            const file = it.getAsFile()
            if (file) {
              addFiles([file])
              setRecentPastes(p => [`📸 ${file.name} (${formatBytes(file.size)})`, ...p].slice(0, 3))
            }
          }
        }
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [isModalOpen, addFiles])

  // Drag handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget === dropZoneRef.current) setDragOver(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) addFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) addFiles(files)
    e.target.value = '' // reset so same file can be selected again
  }

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    // Extract folder name from webkitRelativePath
    const firstPath = (files[0] as any).webkitRelativePath || files[0].name
    const folderName = firstPath.split('/')[0] || 'Uploaded Folder'
    addFolder(files, folderName)
    e.target.value = ''
  }

  const currentFolder = folders.find(f => f.id === destinationFolderId)

  // Hidden inputs
  const input = (
    <>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
      <input ref={folderInputRef} type="file" multiple className="hidden" onChange={handleFolderInput} {...({ webkitdirectory: '', directory: '' } as any)} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
    </>
  )

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="glass-nav w-full max-w-2xl overflow-hidden rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            {input}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <UploadCloud size={18} className="text-primary" /> Upload to CoreFiles
                </h2>
                <p className="text-xs text-muted-foreground">
                  Chunked · resumable · ClamAV-scanned · AES-256 encrypted at rest
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Destination selector */}
              <div className="relative">
                <label className="mb-1.5 block text-xs font-medium">Upload destination</label>
                <button
                  onClick={() => setShowDestinations(s => !s)}
                  className="flex h-10 w-full items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: currentFolder ? `${currentFolder.color}20` : 'var(--muted)', color: currentFolder?.color || 'var(--muted-foreground)' }}>
                    <Folder size={13} />
                  </span>
                  <span className="flex-1 truncate text-left font-medium">{currentFolder?.name || 'Select folder'}</span>
                  <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', showDestinations && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {showDestinations && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="glass-nav absolute z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-xl p-1.5 cf-scroll"
                    >
                      {folders.map(f => (
                        <button
                          key={f.id}
                          onClick={() => { setDestination(f.id); setShowDestinations(false) }}
                          className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-accent', f.id === destinationFolderId && 'bg-accent/60')}
                        >
                          <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `${f.color}20`, color: f.color }}>
                            <Folder size={12} />
                          </span>
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-[9px] text-muted-foreground">{f.fileCount} files</span>
                          {f.id === destinationFolderId && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Drop zone */}
              <div
                ref={dropZoneRef}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  'relative grid place-items-center rounded-2xl border-2 border-dashed py-10 text-center transition-all',
                  dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border'
                )}
              >
                {dragOver ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <UploadCloud size={36} className="text-primary" />
                    <p className="text-sm font-medium text-primary">Drop to upload</p>
                    <p className="text-xs text-muted-foreground">Releasing will add files to the queue</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                    >
                      <UploadCloud size={36} className="text-primary" />
                    </motion.div>
                    <p className="text-sm font-medium">Drag & drop files here</p>
                    <p className="text-xs text-muted-foreground">or choose an option below</p>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <button onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:shadow-glow">
                        <FileIcon size={12} /> Browse Files
                      </button>
                      <button onClick={() => folderInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">
                        <FolderUp size={12} /> Folder Upload
                      </button>
                      <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent sm:hidden">
                        <Camera size={12} /> Camera
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const files = await (navigator as any).clipboard.read?.()
                            if (files?.length) addFiles(files)
                          } catch {
                            // Fallback: prompt user to paste with Ctrl+V
                            window.dispatchEvent(new CustomEvent('cf-toast', { detail: { msg: 'Press Ctrl+V (or Cmd+V) to paste files', variant: 'info' } }))
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                      >
                        <ClipboardPaste size={12} /> Paste
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Paste hint */}
              {recentPastes.length > 0 && (
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-3 py-2">
                  <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Pasted files added to queue:</p>
                  <ul className="mt-1 space-y-0.5">
                    {recentPastes.map((p, i) => (
                      <li key={i} className="text-[10px] text-emerald-600 dark:text-emerald-500">{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Capabilities grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { icon: Layers, label: 'Chunked', value: '8 MB chunks' },
                  { icon: Zap, label: 'Parallel', value: '4 streams' },
                  { icon: ShieldCheck, label: 'ClamAV', value: 'Auto-scan' },
                  { icon: ScanLine, label: 'OCR', value: 'Optional' },
                ].map(c => (
                  <div key={c.label} className="rounded-lg border border-border/60 bg-card/40 p-2.5 text-center">
                    <c.icon size={14} className="mx-auto mb-1 text-primary" />
                    <p className="text-[10px] font-medium">{c.label}</p>
                    <p className="text-[9px] text-muted-foreground">{c.value}</p>
                  </div>
                ))}
              </div>

              {/* AI features */}
              <div className="rounded-xl bg-gradient-to-br from-violet-500/5 to-sky-500/5 border border-violet-500/20 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400">
                  <Brain size={11} /> AI features (auto-enabled)
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:grid-cols-4">
                  <span>• Auto-classify</span>
                  <span>• Auto-tag</span>
                  <span>• Smart folder suggest</span>
                  <span>• Duplicate detection</span>
                </div>
              </div>

              {/* File type support */}
              <details className="group">
                <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <ChevronRight size={12} className="transition-transform group-open:rotate-90" />
                  Supported file types ({Object.keys(FILE_TYPES).length} types, up to 100 GB)
                </summary>
                <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {Object.entries(
                    Object.values(FILE_TYPES).reduce((acc, t) => {
                      acc[t.category] = acc[t.category] || { count: 0, color: t.color, exts: [] as string[] }
                      acc[t.category].count++
                      acc[t.category].exts.push(t.ext)
                      return acc
                    }, {} as Record<string, { count: number; color: string; exts: string[] }>)
                  ).map(([cat, info]) => {
                    const Icon = categoryIcons[cat] || FileText
                    return (
                      <div key={cat} className="rounded-lg border border-border/60 bg-card/40 p-2">
                        <Icon size={14} className="mb-1" style={{ color: info.color }} />
                        <p className="text-[10px] font-medium capitalize">{cat}</p>
                        <p className="text-[9px] text-muted-foreground">{info.count} formats</p>
                      </div>
                    )
                  })}
                </div>
              </details>

              {/* Storage info */}
              <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <HardDrive size={11} /> Encrypted with AES-256 · Signed URLs · 30-day version history
                </span>
                <span>Max 100 GB / file</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
