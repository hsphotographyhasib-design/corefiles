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
  Upload, X, Folder, FolderOpen, ChevronRight, ChevronDown, Search,
  HardDrive, Building2, Star, Clock, Plus, File as FileIcon, Trash2,
  Eye, Pencil, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Zap,
  Brain, ScanLine, Tag, MessageSquare, History, Layers, Cloud, ArrowRight,
  RotateCw, FolderUp, ClipboardPaste, Camera, Image as ImageIcon, Lock,
  FileText, Film, Music, Archive, Ruler, Code, FileSpreadsheet, RefreshCw,
  Check, Share2, FolderTree, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { useUploadEngine } from '@/lib/corefiles/upload-engine'
import { folders, departments, fmtBytes } from '@/components/corefiles/data/mock'
import { getFileConfig, validateFile, formatBytes, FILE_TYPES } from '@/lib/corefiles/upload-validation'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

// ====================== Mock upload history (in production: from API) ======================

interface UploadHistoryEntry {
  id: string
  filename: string
  destination: string
  size: number
  status: 'completed' | 'failed' | 'pending' | 'cancelled'
  uploadedAt: string
  durationMs: number
}

const mockHistory: UploadHistoryEntry[] = [
  { id: 'h1', filename: 'Foundation Design Report v6.pdf', destination: 'Projects / Drawings', size: 8_900_000, status: 'completed', uploadedAt: new Date(Date.now() - 5 * 60_000).toISOString(), durationMs: 4200 },
  { id: 'h2', filename: 'Tower A — Electrical Layout.dwg', destination: 'Projects / Drawings', size: 18_400_000, status: 'completed', uploadedAt: new Date(Date.now() - 25 * 60_000).toISOString(), durationMs: 12400 },
  { id: 'h3', filename: 'Q3 Financial Statement.xlsx', destination: 'Finance / Invoices', size: 2_300_000, status: 'failed', uploadedAt: new Date(Date.now() - 2 * 3600_000).toISOString(), durationMs: 0 },
  { id: 'h4', filename: 'Site Survey.mp4', destination: 'Projects / Videos', size: 184_000_000, status: 'completed', uploadedAt: new Date(Date.now() - 5 * 3600_000).toISOString(), durationMs: 84200 },
  { id: 'h5', filename: 'Vendor Contract.pdf', destination: 'Contracts', size: 1_400_000, status: 'completed', uploadedAt: new Date(Date.now() - 28 * 3600_000).toISOString(), durationMs: 2100 },
]

// ====================== Local workspace state ======================

interface UploadOptions {
  replaceExisting: boolean
  keepBoth: boolean
  createNewVersion: boolean
  compress: boolean
  virusScan: boolean
  generatePreview: boolean
  ocr: boolean
  generateThumbnail: boolean
  notifyTeam: boolean
}

interface FileMetadata {
  title: string
  description: string
  tags: string[]
  department: string
  project: string
  category: string
  confidentialLevel: 'public' | 'internal' | 'confidential' | 'restricted'
  retentionPolicy: string
  revision: string
  documentNumber: string
}

interface SelectedFile {
  id: string
  file: File
  name: string
  size: number
  ext: string
  validation: ReturnType<typeof validateFile>
  preview?: string
  renamedTo?: string
}

type UploadPhase = 'configure' | 'uploading' | 'success'

// ====================== Main view ======================

export function UploadWorkspaceView() {
  const { setView, setBreadcrumbs } = useApp()
  const { addFiles, items: engineItems, isManagerOpen, setManagerOpen } = useUploadEngine()

  const [destinationFolderId, setDestinationFolderId] = React.useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([])
  const [phase, setPhase] = React.useState<UploadPhase>('configure')
  const [activeFileId, setActiveFileId] = React.useState<string | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set(['f-root', 'f-admin', 'f-proj']))

  const [options, setOptions] = React.useState<UploadOptions>({
    replaceExisting: false,
    keepBoth: true,
    createNewVersion: false,
    compress: false,
    virusScan: true,
    generatePreview: true,
    ocr: false,
    generateThumbnail: true,
    notifyTeam: false,
  })

  const [metadata, setMetadata] = React.useState<FileMetadata>({
    title: '', description: '', tags: [], department: '', project: '',
    category: '', confidentialLevel: 'internal', retentionPolicy: '7-years',
    revision: '1.0', documentNumber: '',
  })

  const destinationFolder = folders.find(f => f.id === destinationFolderId)
  const activeFile = selectedFiles.find(f => f.id === activeFileId)

  // Set breadcrumb
  React.useEffect(() => {
    setBreadcrumbs([{ label: 'Upload Files', view: 'upload' }])
  }, [setBreadcrumbs])

  // ====================== File selection handlers ======================

  const handleFilesAdded = React.useCallback((newFiles: File[]) => {
    const newSelected: SelectedFile[] = newFiles.map(file => {
      const id = `sel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const validation = validateFile(file)
      const cfg = getFileConfig(file.name)
      // Generate preview for images
      let preview: string | undefined
      if (cfg?.category === 'image') {
        try { preview = URL.createObjectURL(file) } catch { /* ignore */ }
      }
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        ext: file.name.split('.').pop()?.toLowerCase() || '',
        validation,
        preview,
      }
    })
    setSelectedFiles(prev => [...prev, ...newSelected])
    if (newSelected.length > 0 && !activeFileId) setActiveFileId(newSelected[0].id)
  }, [activeFileId])

  const removeSelectedFile = (id: string) => {
    setSelectedFiles(prev => {
      const next = prev.filter(f => f.id !== id)
      if (activeFileId === id) setActiveFileId(next[0]?.id || null)
      // Revoke object URL to prevent memory leak
      const removed = prev.find(f => f.id === id)
      if (removed?.preview) URL.revokeObjectURL(removed.preview)
      return next
    })
  }

  const renameFile = (id: string, newName: string) => {
    setSelectedFiles(prev => prev.map(f => f.id === id ? { ...f, renamedTo: newName, name: newName } : f))
  }

  // ====================== Drag & drop ======================

  const [dragOver, setDragOver] = React.useState(false)
  const dropZoneRef = React.useRef<HTMLDivElement>(null)

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget === dropZoneRef.current) setDragOver(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFilesAdded(files)
  }

  // Hidden file inputs
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const folderInputRef = React.useRef<HTMLInputElement>(null)
  const cameraInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) handleFilesAdded(files)
    e.target.value = ''
  }

  // Clipboard paste listener
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || [])
      if (files.length > 0) {
        handleFilesAdded(files)
        toast(`Pasted ${files.length} file(s)`)
      }
      const items = e.clipboardData?.items
      if (items) {
        const imageFiles: File[] = []
        for (const it of items) {
          if (it.type.startsWith('image/')) {
            const f = it.getAsFile()
            if (f) imageFiles.push(f)
          }
        }
        if (imageFiles.length > 0) handleFilesAdded(imageFiles)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [handleFilesAdded])

  // ====================== Start upload ======================

  const canStartUpload = destinationFolderId !== null
    && selectedFiles.length > 0
    && selectedFiles.every(f => f.validation.valid)
    && phase === 'configure'

  const handleStartUpload = async () => {
    if (!canStartUpload || !destinationFolder) return
    setPhase('uploading')
    // Hand off to the upload engine — it manages the queue, chunks, scan, complete
    const filesToUpload = selectedFiles.map(f => f.renamedTo ? new File([f.file], f.renamedTo, { type: f.file.type }) : f.file)
    await addFiles(filesToUpload, destinationFolder.id, destinationFolder.name)
    // Engine will open its own manager widget; show success after a delay
    setTimeout(() => {
      setPhase('success')
    }, 3500)
  }

  const handleReset = () => {
    selectedFiles.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
    setSelectedFiles([])
    setActiveFileId(null)
    setPhase('configure')
  }

  // ====================== Render ======================

  if (phase === 'success') {
    return <SuccessView
      files={selectedFiles}
      destination={destinationFolder?.name || 'folder'}
      onReset={handleReset}
      onOpenFolder={() => { setView('files'); setBreadcrumbs([{ label: 'Files', view: 'files' }]) }}
    />
  }

  return (
    <div className="space-y-4">
      {/* ====================== Page header ====================== */}
      <div className="glass cf-lift shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('dashboard')}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-border/60 bg-background/40 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Back"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Upload size={20} className="text-primary" /> Upload Files
            </h1>
            <p className="text-xs text-muted-foreground">Upload files securely into your organization</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setView('files'); setBreadcrumbs([{ label: 'Files', view: 'files' }]) }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent"
          >
            <X size={13} /> Cancel
          </button>
          <button
            onClick={() => setManagerOpen(!isManagerOpen)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
              engineItems.length > 0
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-background/60 text-muted-foreground hover:bg-accent"
            )}
          >
            <Layers size={13} /> Upload Queue
            {engineItems.length > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                {engineItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowHistoryPanel(s => !s)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
              showHistoryPanel ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background/60 text-muted-foreground hover:bg-accent"
            )}
          >
            <History size={13} /> Upload History
          </button>
        </div>
      </div>

      {/* ====================== Two-column layout ====================== */}
      <div className="grid gap-4 lg:grid-cols-[35fr_65fr]">
        {/* ====================== LEFT PANEL (35%) ====================== */}
        <div className="space-y-4">
          <DestinationPanel
            destinationFolderId={destinationFolderId}
            onSelect={setDestinationFolderId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            expandedNodes={expandedNodes}
            setExpandedNodes={setExpandedNodes}
          />
          <StorageInfoPanel destinationFolderId={destinationFolderId} />
        </div>

        {/* ====================== RIGHT PANEL (65%) ====================== */}
        <div className="space-y-4">
          {/* Drag & drop area */}
          <div
            ref={dropZoneRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              'glass cf-lift relative grid place-items-center overflow-hidden rounded-2xl border-2 border-dashed py-12 text-center transition-all',
              dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border'
            )}
          >
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
            <input ref={folderInputRef} type="file" multiple className="hidden" onChange={handleFileInput} {...({ webkitdirectory: '', directory: '' } as any)} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />

            {dragOver ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
                <Upload size={40} className="text-primary" />
                <p className="text-base font-semibold text-primary">Drop to upload</p>
                <p className="text-xs text-muted-foreground">Release to add files to the queue</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-4">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                  className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-glow"
                >
                  <Cloud size={32} />
                </motion.div>
                <div>
                  <p className="text-base font-semibold">Drag & drop files here</p>
                  <p className="text-xs text-muted-foreground">or choose an option below — supports files up to 100 GB</p>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
                    <FileIcon size={13} /> Browse Files
                  </button>
                  <button onClick={() => folderInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent">
                    <FolderUp size={13} /> Folder Upload
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent sm:hidden">
                    <Camera size={13} /> Camera
                  </button>
                  <button onClick={() => toast('Press Ctrl+V to paste files from clipboard')} className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent">
                    <ClipboardPaste size={13} /> Paste
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-1">Images</span>
                  <span className="rounded bg-muted px-2 py-1">Videos</span>
                  <span className="rounded bg-muted px-2 py-1">PDF</span>
                  <span className="rounded bg-muted px-2 py-1">Office</span>
                  <span className="rounded bg-muted px-2 py-1">CAD (DWG/DXF/IFC)</span>
                  <span className="rounded bg-muted px-2 py-1">Archives</span>
                  <span className="rounded bg-muted px-2 py-1">+ 30 more</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <FileListPanel
              files={selectedFiles}
              activeFileId={activeFileId}
              onSelectActive={setActiveFileId}
              onRemove={removeSelectedFile}
              onRename={renameFile}
              destinationFolderName={destinationFolder?.name}
            />
          )}

          {/* Upload options + metadata (when files are selected) */}
          {selectedFiles.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <UploadOptionsPanel options={options} onChange={setOptions} />
              <MetadataPanel metadata={metadata} onChange={setMetadata} activeFile={activeFile} />
            </div>
          )}

          {/* Start Upload button (sticky bottom-right) */}
          <AnimatePresence>
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="sticky bottom-4 z-20 flex justify-end"
              >
                <button
                  onClick={handleStartUpload}
                  disabled={!canStartUpload}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-float transition-all',
                    canStartUpload
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-glow active:scale-[0.98]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {phase === 'uploading' ? (
                    <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><Upload size={16} /> Start Upload ({selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''})</>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====================== History panel (slide-in sidebar) ====================== */}
      <AnimatePresence>
        {showHistoryPanel && (
          <HistorySidebar onClose={() => setShowHistoryPanel(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ====================== Destination panel (left, 35%) ======================

function DestinationPanel({
  destinationFolderId, onSelect, searchQuery, setSearchQuery, expandedNodes, setExpandedNodes,
}: {
  destinationFolderId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  expandedNodes: Set<string>
  setExpandedNodes: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const toggle = (id: string) =>
    setExpandedNodes(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const filtered = React.useMemo(() => {
    if (!searchQuery.trim()) return folders
    const q = searchQuery.toLowerCase()
    return folders.filter(f => f.name.toLowerCase().includes(q))
  }, [searchQuery])

  const childrenOf = (parentId: string | null) =>
    filtered.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name))

  const recentFolders = folders.slice(0, 4)

  const renderTree = (parentId: string | null, depth = 0) => {
    const children = childrenOf(parentId)
    if (children.length === 0) return null
    return children.map(folder => {
      const isExpanded = expandedNodes.has(folder.id)
      const hasChildren = folders.some(f => f.parentId === folder.id)
      const isSelected = destinationFolderId === folder.id
      const dept = folder.departmentId ? departments.find(d => d.id === folder.departmentId) : null
      return (
        <div key={folder.id}>
          <button
            onClick={() => { onSelect(folder.id); if (hasChildren) toggle(folder.id) }}
            className={cn(
              'group flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
              isSelected ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent/60'
            )}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            {hasChildren ? (
              <span className="grid h-4 w-4 place-items-center text-muted-foreground">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
            ) : <span className="w-4" />}
            <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `${folder.color || '#10b981'}20`, color: folder.color || '#10b981' }}>
              {isExpanded ? <FolderOpen size={12} /> : <Folder size={12} />}
            </span>
            <span className="flex-1 truncate">{folder.name}</span>
            {dept && <span className="text-[9px] text-muted-foreground">{dept.name}</span>}
            {isSelected && <Check size={12} className="text-primary" />}
          </button>
          {isExpanded && hasChildren && <div>{renderTree(folder.id, depth + 1)}</div>}
        </div>
      )
    })
  }

  return (
    <div className="glass cf-lift shadow-float rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <FolderTree size={15} className="text-primary" /> Destination
        </h3>
        <button onClick={() => toast('Create new folder dialog')} className="text-xs text-primary hover:underline">
          <Plus size={11} className="inline" /> New
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search folders…"
          className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-xs outline-none focus:border-primary"
        />
      </div>

      {/* Recent folders */}
      {!searchQuery && (
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent locations</p>
          <div className="flex flex-wrap gap-1.5">
            {recentFolders.map(f => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className={cn(
                  'flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors',
                  destinationFolderId === f.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'
                )}
              >
                <Clock size={9} /> {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="cf-scroll max-h-[40vh] overflow-y-auto -mr-1 pr-1">
        {renderTree(null)}
      </div>

      {/* Hint */}
      <p className="mt-2 rounded-md bg-muted/40 px-2 py-1.5 text-[9px] text-muted-foreground">
        <Lock size={9} className="inline mr-1" />
        Only folders you have permission to access are shown.
      </p>
    </div>
  )
}

// ====================== Storage info panel ======================

function StorageInfoPanel({ destinationFolderId }: { destinationFolderId: string | null }) {
  const folder = folders.find(f => f.id === destinationFolderId)
  const dept = folder?.departmentId ? departments.find(d => d.id === folder.departmentId) : null
  const totalUsed = departments.reduce((s, d) => s + d.storageUsedBytes, 0)
  const totalQuota = departments.reduce((s, d) => s + d.storageQuotaBytes, 0)
  const orgPct = Math.round((totalUsed / totalQuota) * 100)

  return (
    <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <HardDrive size={15} className="text-primary" /> Storage Information
      </h3>
      {folder ? (
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Current path</p>
            <p className="text-xs font-medium">{folder.name}</p>
          </div>
          {dept && (
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">Department</p>
                <p className="font-medium" style={{ color: dept.color }}>{dept.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p className="font-medium">Hasan Rahman</p>
              </div>
              <div>
                <p className="text-muted-foreground">Permission</p>
                <p className="font-medium text-emerald-500">Read + Write</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-medium">{fmtBytes(dept.storageQuotaBytes - dept.storageUsedBytes)}</p>
              </div>
            </div>
          )}
          <div>
            <div className="mb-1 flex justify-between text-[10px]">
              <span className="text-muted-foreground">Folder quota</span>
              <span className="font-medium">{fmtBytes(folder.sizeBytes)} / {fmtBytes(folder.sizeBytes * 5)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (folder.sizeBytes / (folder.sizeBytes * 5)) * 100)}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-center text-[11px] text-muted-foreground">
          <Building2 size={24} className="mx-auto opacity-30" />
          <p>Select a destination folder to see storage info</p>
        </div>
      )}
      <div className="mt-3 border-t border-border/40 pt-3">
        <div className="mb-1 flex justify-between text-[10px]">
          <span className="text-muted-foreground">Organization total</span>
          <span className="font-medium">{fmtBytes(totalUsed)} / {fmtBytes(totalQuota)} ({orgPct}%)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={cn('h-full rounded-full', orgPct > 80 ? 'bg-rose-500' : orgPct > 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${orgPct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ====================== File list panel ======================

const fileIconByExt: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  pdf: FileText, doc: FileText, docx: FileText,
  xls: FileSpreadsheet, xlsx: FileSpreadsheet, csv: FileSpreadsheet,
  ppt: FileText, pptx: FileText,
  jpg: ImageIcon, jpeg: ImageIcon, png: ImageIcon, gif: ImageIcon, webp: ImageIcon, svg: ImageIcon,
  mp4: Film, mov: Film, avi: Film, mkv: Film, webm: Film,
  mp3: Music, wav: Music, flac: Music,
  zip: Archive, rar: Archive, '7z': Archive, tar: Archive, gz: Archive,
  dwg: Ruler, dxf: Ruler, ifc: Ruler,
  txt: FileText, md: FileText, json: Code, xml: Code, js: Code, ts: Code, py: Code,
}

function FileListPanel({
  files, activeFileId, onSelectActive, onRemove, onRename, destinationFolderName,
}: {
  files: SelectedFile[]
  activeFileId: string | null
  onSelectActive: (id: string) => void
  onRemove: (id: string) => void
  onRename: (id: string, name: string) => void
  destinationFolderName?: string
}) {
  return (
    <div className="glass cf-lift shadow-float rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Layers size={15} className="text-primary" /> Selected Files
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{files.length}</span>
        </h3>
        <span className="text-[10px] text-muted-foreground">
          Total: {formatBytes(files.reduce((s, f) => s + f.size, 0))}
        </span>
      </div>
      <div className="cf-scroll max-h-[40vh] space-y-1 overflow-y-auto -mr-1 pr-1">
        {files.map((f, i) => {
          const cfg = getFileConfig(f.name)
          const Icon = fileIconByExt[f.ext] || FileText
          const isActive = activeFileId === f.id
          const valid = f.validation.valid
          return (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className={cn(
                'group flex items-center gap-2 rounded-lg border p-2 transition-colors',
                isActive ? 'border-primary bg-primary/5' : 'border-border/60 bg-card/40 hover:border-primary/30'
              )}
              onClick={() => onSelectActive(f.id)}
            >
              {/* Thumbnail / icon */}
              <div className="relative h-10 w-10 shrink-0">
                {f.preview ? (
                  <img src={f.preview} alt={f.name} className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-lg" style={{ background: cfg ? `${cfg.color}20` : 'var(--muted)', color: cfg?.color || 'var(--muted-foreground)' }}>
                    <Icon size={16} />
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                {f.renamedTo !== undefined ? (
                  <input
                    value={f.renamedTo}
                    onChange={e => onRename(f.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    className="w-full rounded border border-primary bg-background px-1 py-0.5 text-xs font-medium outline-none"
                    autoFocus
                  />
                ) : (
                  <p className="truncate text-xs font-medium" title={f.name}>{f.name}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {formatBytes(f.size)} · {f.ext.toUpperCase()}
                  {destinationFolderName && ` · → ${destinationFolderName}`}
                </p>
                {!valid && (
                  <p className="text-[10px] text-rose-500">⚠ {f.validation.error}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => { e.stopPropagation(); onRename(f.id, f.name) }}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-primary"
                  title="Rename before upload"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectActive(f.id) }}
                  className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-primary"
                  title="Preview"
                >
                  <Eye size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(f.id) }}
                  className="rounded-md p-1 text-muted-foreground hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                  title="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ====================== Upload options panel ======================

function UploadOptionsPanel({ options, onChange }: { options: UploadOptions; onChange: (o: UploadOptions) => void }) {
  const items: { key: keyof UploadOptions; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; default?: boolean }[] = [
    { key: 'replaceExisting', label: 'Replace existing', desc: 'Overwrite files with same name', icon: RotateCw },
    { key: 'keepBoth', label: 'Keep both', desc: 'Rename duplicates (e.g. "file (1).pdf")', icon: Layers },
    { key: 'createNewVersion', label: 'Create new version', desc: 'Add as new version of existing file', icon: History },
    { key: 'compress', label: 'Compress before upload', desc: 'Reduce file size (images only)', icon: Archive },
    { key: 'virusScan', label: 'Virus scan (ClamAV)', desc: 'Scan every file before storage', icon: ShieldCheck },
    { key: 'generatePreview', label: 'Generate preview', desc: 'Auto-render preview for PDFs, Office, images', icon: Eye },
    { key: 'ocr', label: 'OCR scanned docs', desc: 'Extract text from images & scanned PDFs', icon: ScanLine },
    { key: 'generateThumbnail', label: 'Generate thumbnail', desc: 'Auto-create thumbnails for files', icon: ImageIcon },
    { key: 'notifyTeam', label: 'Notify team', desc: 'Send notification to department members', icon: MessageSquare },
  ]

  const toggle = (key: keyof UploadOptions) => onChange({ ...options, [key]: !options[key] })

  return (
    <div className="glass cf-lift shadow-float rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Zap size={15} className="text-primary" /> Upload Options
      </h3>
      <div className="space-y-1">
        {items.map(item => {
          const enabled = options[item.key]
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className={cn(
                'flex w-full items-start gap-2 rounded-lg p-2 text-left transition-colors',
                enabled ? 'bg-primary/5' : 'hover:bg-accent/40'
              )}
            >
              <item.icon size={14} className={cn('mt-0.5 shrink-0', enabled ? 'text-primary' : 'text-muted-foreground')} />
              <div className="min-w-0 flex-1">
                <p className={cn('text-xs font-medium', enabled && 'text-primary')}>{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
              <span className={cn(
                'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border transition-colors',
                enabled ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
              )}>
                {enabled && <Check size={10} />}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ====================== Metadata panel ======================

function MetadataPanel({ metadata, onChange, activeFile }: {
  metadata: FileMetadata
  onChange: (m: FileMetadata) => void
  activeFile?: SelectedFile
}) {
  const [tagInput, setTagInput] = React.useState('')

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !metadata.tags.includes(t)) {
      onChange({ ...metadata, tags: [...metadata.tags, t] })
    }
    setTagInput('')
  }

  return (
    <div className="glass cf-lift shadow-float rounded-2xl p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Tag size={15} className="text-primary" /> Metadata
        {activeFile && <span className="text-[10px] font-normal text-muted-foreground">for {activeFile.name.slice(0, 24)}{activeFile.name.length > 24 ? '…' : ''}</span>}
      </h3>
      <div className="space-y-2">
        <div>
          <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Title</label>
          <input
            value={metadata.title}
            onChange={e => onChange({ ...metadata, title: e.target.value })}
            placeholder={activeFile?.name || 'Document title…'}
            className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Description</label>
          <textarea
            value={metadata.description}
            onChange={e => onChange({ ...metadata, description: e.target.value })}
            placeholder="Add a description for this document…"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-background/60 px-2 py-1 text-xs outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Tags</label>
          <div className="flex gap-1">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              placeholder="Add tag…"
              className="h-8 flex-1 rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            />
            <button onClick={addTag} className="rounded-md bg-primary px-2 text-xs text-primary-foreground">Add</button>
          </div>
          {metadata.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {metadata.tags.map(t => (
                <span key={t} className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  #{t}
                  <button onClick={() => onChange({ ...metadata, tags: metadata.tags.filter(x => x !== t) })} className="hover:text-primary-foreground">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Department</label>
            <select
              value={metadata.department}
              onChange={e => onChange({ ...metadata, department: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            >
              <option value="">—</option>
              {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Project</label>
            <input
              value={metadata.project}
              onChange={e => onChange({ ...metadata, project: e.target.value })}
              placeholder="Project name…"
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Confidentiality</label>
            <select
              value={metadata.confidentialLevel}
              onChange={e => onChange({ ...metadata, confidentialLevel: e.target.value as FileMetadata['confidentialLevel'] })}
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="confidential">Confidential</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Retention policy</label>
            <select
              value={metadata.retentionPolicy}
              onChange={e => onChange({ ...metadata, retentionPolicy: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            >
              <option value="7-years">7 years</option>
              <option value="10-years">10 years</option>
              <option value="permanent">Permanent</option>
              <option value="project-based">Project-based</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Revision</label>
            <input
              value={metadata.revision}
              onChange={e => onChange({ ...metadata, revision: e.target.value })}
              placeholder="1.0"
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Document #</label>
            <input
              value={metadata.documentNumber}
              onChange={e => onChange({ ...metadata, documentNumber: e.target.value })}
              placeholder="DOC-2026-001"
              className="h-8 w-full rounded-md border border-border bg-background/60 px-2 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ====================== History sidebar ======================

function HistorySidebar({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = React.useState<'all' | 'completed' | 'failed' | 'pending' | 'cancelled'>('all')
  const filtered = filter === 'all' ? mockHistory : mockHistory.filter(h => h.status === filter)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: 380 }}
        animate={{ x: 0 }}
        exit={{ x: 380 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="glass-nav fixed bottom-5 right-5 top-[108px] z-40 w-[380px] overflow-hidden rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <History size={15} className="text-primary" /> Upload History
          </h3>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent">
            <X size={14} />
          </button>
        </div>
        <div className="flex gap-1 border-b border-border/40 px-3 py-2">
          {(['all', 'completed', 'failed', 'pending', 'cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-medium capitalize transition-colors',
                filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent'
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="cf-scroll max-h-[calc(100vh-260px)] overflow-y-auto p-2">
          {filtered.map(h => (
            <div key={h.id} className="mb-1 rounded-lg border border-border/40 p-2.5">
              <div className="flex items-start gap-2">
                <FileIcon size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{h.filename}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{h.destination}</p>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    {formatBytes(h.size)} · {formatDistanceToNow(new Date(h.uploadedAt), { addSuffix: true })}
                  </p>
                </div>
                <span className={cn(
                  'rounded px-1.5 py-0.5 text-[9px] font-medium capitalize',
                  h.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                  h.status === 'failed' ? 'bg-rose-500/10 text-rose-600' :
                  h.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-muted text-muted-foreground'
                )}>
                  {h.status}
                </span>
              </div>
              {(h.status === 'failed' || h.status === 'cancelled') && (
                <button className="mt-1.5 flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <RotateCw size={10} /> Retry
                </button>
              )}
              {h.status === 'completed' && (
                <button className="mt-1.5 flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <FolderOpen size={10} /> Open folder
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.aside>
    </>
  )
}

// ====================== Success view ======================

function SuccessView({ files, destination, onReset, onOpenFolder }: {
  files: SelectedFile[]
  destination: string
  onReset: () => void
  onOpenFolder: () => void
}) {
  const { setView, setBreadcrumbs } = useApp()
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="glass cf-lift shadow-float w-full max-w-lg rounded-3xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h1 className="text-2xl font-bold">Upload Successful!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''} uploaded successfully to <span className="font-semibold text-foreground">{destination}</span>.
        </p>

        {/* Uploaded files summary */}
        <div className="mt-4 max-h-32 overflow-y-auto cf-scroll rounded-xl bg-muted/40 p-3 text-left">
          {files.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2 py-0.5 text-xs">
              <CheckCircle2 size={11} className="text-emerald-500" />
              <span className="truncate">{f.renamedTo || f.name}</span>
              <span className="ml-auto text-muted-foreground">{formatBytes(f.size)}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={onOpenFolder}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
          >
            <FolderOpen size={14} /> Open Folder
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Upload size={14} /> Upload More
          </button>
          <button
            onClick={() => toast('Share dialog opened')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Share2 size={14} /> Share Files
          </button>
          <button
            onClick={() => { setView('activity-logs'); setBreadcrumbs([{ label: 'Activity Logs', view: 'activity-logs' }]) }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Activity size={14} /> View Activity
          </button>
        </div>
      </motion.div>
    </div>
  )
}
