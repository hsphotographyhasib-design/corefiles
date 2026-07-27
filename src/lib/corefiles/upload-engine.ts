/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import { create } from 'zustand'
import {
  validateFile, sanitizeFilename, getExtension, getFileConfig,
  formatBytes, computeChecksum,
  type FileTypeConfig, type ValidationResult,
} from '@/lib/corefiles/upload-validation'
import type { ViewKey } from '@/lib/corefiles/store'

// ----------------------------- Types -----------------------------

export type UploadStatus =
  | 'queued'           // waiting to start
  | 'validating'       // running client-side validation
  | 'pending_conflict' // waiting for user to resolve duplicate
  | 'init'             // calling POST /uploads/init
  | 'uploading'        // chunks in flight
  | 'paused'           // user paused
  | 'chunk_failed'     // a chunk failed, will auto-retry
  | 'scanning'         // ClamAV scan in progress (simulated)
  | 'completing'       // calling POST /uploads/complete
  | 'completed'
  | 'failed'           // unrecoverable
  | 'cancelled'

export interface UploadChunk {
  index: number
  offset: number
  size: number
  status: 'pending' | 'uploading' | 'done' | 'failed'
  attempts: number
  uploadedBytes: number
}

export interface UploadItem {
  id: string
  file: File
  name: string            // sanitized
  originalName: string
  ext: string
  size: number
  mime: string
  fileConfig: FileTypeConfig | null
  validation: ValidationResult

  // Destination
  folderId: string
  folderName: string
  departmentId?: string

  // State
  status: UploadStatus
  progress: number        // 0-100
  uploadedBytes: number
  speed: number           // bytes/sec
  eta: number             // seconds
  startedAt?: number
  completedAt?: number
  error?: string

  // Chunks
  chunkSize: number
  chunks: UploadChunk[]
  currentChunkIndex: number
  parallelStreams: number

  // Conflict resolution
  conflictResolution?: 'replace' | 'keep_both' | 'new_version' | 'skip'
  existingFileId?: string

  // Metadata
  checksum?: string
  sessionId?: string       // backend upload session ID
  storagePath?: string
  priority: number         // higher = sooner
  retryCount: number
}

interface UploadEngineState {
  items: UploadItem[]
  isManagerOpen: boolean
  isModalOpen: boolean
  destinationFolderId: string
  parallelUploads: number
  totalUploaded: number
  totalFailed: number

  // Actions
  addFiles: (files: File[], folderId?: string, folderName?: string) => Promise<void>
  addFolder: (files: File[], folderName: string) => Promise<void>
  removeItem: (id: string) => void
  clearCompleted: () => void
  retryItem: (id: string) => void
  pauseItem: (id: string) => void
  resumeItem: (id: string) => void
  cancelItem: (id: string) => void
  setConflictResolution: (id: string, resolution: NonNullable<UploadItem['conflictResolution']>) => void
  setDestination: (folderId: string) => void
  setManagerOpen: (open: boolean) => void
  setModalOpen: (open: boolean) => void
  setParallelUploads: (n: number) => void

  // Selectors
  activeCount: () => number
  completedCount: () => number
  failedCount: () => number
  queuedCount: () => number
  overallProgress: () => number
  totalSpeed: () => number
  pendingConflicts: () => UploadItem[]
}

const CHUNK_SIZE = 8 * 1024 ** 2 // 8 MB chunks
const MAX_PARALLEL_STREAMS = 4
const MAX_CONCURRENT_UPLOADS = 3

// ----------------------------- Store -----------------------------

export const useUploadEngine = create<UploadEngineState>((set, get) => ({
  items: [],
  isManagerOpen: false,
  isModalOpen: false,
  destinationFolderId: 'f-root',
  parallelUploads: MAX_CONCURRENT_UPLOADS,
  totalUploaded: 0,
  totalFailed: 0,

  addFiles: async (files, folderId, folderName) => {
    const targetFolder = folderId || get().destinationFolderId
    const targetName = folderName || 'Hasanur Jaya'
    const newItems: UploadItem[] = []

    for (const file of files) {
      const validation = validateFile(file)
      const id = `up-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const sanitized = sanitizeFilename(file.name)
      const ext = getExtension(file.name)
      const cfg = getFileConfig(file.name)

      const chunkCount = Math.max(1, Math.ceil(file.size / CHUNK_SIZE))
      const chunks: UploadChunk[] = Array.from({ length: chunkCount }, (_, i) => ({
        index: i,
        offset: i * CHUNK_SIZE,
        size: Math.min(CHUNK_SIZE, file.size - i * CHUNK_SIZE),
        status: 'pending' as const,
        attempts: 0,
        uploadedBytes: 0,
      }))

      const item: UploadItem = {
        id,
        file,
        name: sanitized,
        originalName: file.name,
        ext,
        size: file.size,
        mime: file.type || cfg?.mime || 'application/octet-stream',
        fileConfig: cfg,
        validation,
        folderId: targetFolder,
        folderName: targetName,
        status: validation.valid ? 'queued' : 'failed',
        progress: 0,
        uploadedBytes: 0,
        speed: 0,
        eta: 0,
        chunkSize: CHUNK_SIZE,
        chunks,
        currentChunkIndex: 0,
        parallelStreams: MAX_PARALLEL_STREAMS,
        priority: 1,
        retryCount: 0,
        error: validation.valid ? undefined : validation.error,
      }
      newItems.push(item)
    }

    set(s => ({ items: [...s.items, ...newItems], isManagerOpen: true }))

    // Compute checksums + start processing
    for (const item of newItems) {
      if (!item.validation.valid) continue
      // Async checksum
      computeChecksum(item.file).then(checksum => {
        set(s => ({
          items: s.items.map(i => i.id === item.id ? { ...i, checksum, status: 'validating' } : i),
        }))
        // Check for duplicates after checksum
        setTimeout(() => checkDuplicateAndProcess(item.id, checksum), 200)
      })
    }
  },

  addFolder: async (files, folderName) => {
    // Treat each file in folder upload — preserve relative paths
    await get().addFiles(files, get().destinationFolderId, folderName)
    // Toast about folder upload
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cf-toast', {
        detail: { msg: `Uploading folder "${folderName}" with ${files.length} files`, variant: 'info' },
      }))
    }
  },

  removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
  clearCompleted: () => set(s => ({
    items: s.items.filter(i => i.status !== 'completed' && i.status !== 'cancelled'),
  })),
  retryItem: (id) => {
    const item = get().items.find(i => i.id === id)
    if (!item) return
    set(s => ({
      items: s.items.map(i => i.id === id ? {
        ...i,
        status: 'queued',
        progress: 0,
        uploadedBytes: 0,
        error: undefined,
        retryCount: i.retryCount + 1,
        chunks: i.chunks.map(c => ({ ...c, status: 'pending' as const, attempts: 0, uploadedBytes: 0 })),
        currentChunkIndex: 0,
      } : i),
    }))
    setTimeout(() => processQueue(), 100)
  },
  pauseItem: (id) => set(s => ({
    items: s.items.map(i => i.id === id && i.status === 'uploading' ? { ...i, status: 'paused' } : i),
  })),
  resumeItem: (id) => {
    set(s => ({ items: s.items.map(i => i.id === id && i.status === 'paused' ? { ...i, status: 'queued' } : i) }))
    setTimeout(() => processQueue(), 100)
  },
  cancelItem: (id) => set(s => ({
    items: s.items.map(i => i.id === id && !['completed', 'cancelled'].includes(i.status)
      ? { ...i, status: 'cancelled' as const, error: 'Cancelled by user' }
      : i),
  })),
  setConflictResolution: (id, resolution) => {
    set(s => ({ items: s.items.map(i => i.id === id ? { ...i, conflictResolution: resolution, status: 'queued' } : i) }))
    setTimeout(() => processQueue(), 100)
  },
  setDestination: (folderId) => set({ destinationFolderId: folderId }),
  setManagerOpen: (open) => set({ isManagerOpen: open }),
  setModalOpen: (open) => set({ isModalOpen: open }),
  setParallelUploads: (n) => set({ parallelUploads: Math.max(1, Math.min(8, n)) }),

  activeCount: () => get().items.filter(i => ['uploading', 'init', 'completing', 'scanning', 'validating'].includes(i.status)).length,
  completedCount: () => get().items.filter(i => i.status === 'completed').length,
  failedCount: () => get().items.filter(i => i.status === 'failed').length,
  queuedCount: () => get().items.filter(i => i.status === 'queued').length,
  overallProgress: () => {
    const items = get().items
    if (items.length === 0) return 0
    return items.reduce((s, i) => s + i.progress, 0) / items.length
  },
  totalSpeed: () => get().items.filter(i => i.status === 'uploading').reduce((s, i) => s + i.speed, 0),
  pendingConflicts: () => get().items.filter(i => i.status === 'pending_conflict'),
}))

// ----------------------------- Duplicate detection -----------------------------

/** Simulated existing files (in production: SELECT FROM files WHERE checksum = ?). */
const existingChecksums = new Map<string, { fileId: string; name: string; version: number }>([
  ['sha256:a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', { fileId: 'fl-1', name: 'ISO 9001 Quality Manual.pdf', version: 3 }],
])

async function checkDuplicateAndProcess(itemId: string, checksum: string) {
  const item = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!item) return

  // Check by checksum
  const existing = existingChecksums.get(checksum)
  if (existing && Math.random() > 0.7) {
    // 30% chance of duplicate detection for demo
    set_item_status(itemId, 'pending_conflict', { existingFileId: existing.fileId })
    return
  }

  // Check by filename in target folder
  if (Math.random() > 0.85) {
    // 15% chance of name collision
    set_item_status(itemId, 'pending_conflict', {
      existingFileId: 'fl-sim-' + Math.random().toString(36).slice(2, 8),
    })
    return
  }

  // No conflict — proceed to queue
  set_item_status(itemId, 'queued')
  setTimeout(() => processQueue(), 50)
}

function set_item_status(itemId: string, status: UploadStatus, extra?: Partial<UploadItem>) {
  useUploadEngine.setState(s => ({
    items: s.items.map(i => i.id === itemId ? { ...i, status, ...extra } : i),
  }))
}

// ----------------------------- Queue processor -----------------------------

let processing = false

async function processQueue() {
  if (processing) return
  processing = true

  try {
    while (true) {
      const state = useUploadEngine.getState()
      const active = state.items.filter(i => ['init', 'uploading', 'completing', 'scanning'].includes(i.status))
      const queued = state.items
        .filter(i => i.status === 'queued' || i.status === 'chunk_failed')
        .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))

      if (queued.length === 0 || active.length >= state.parallelUploads) break

      const next = queued[0]
      await startUpload(next.id)
    }
  } finally {
    processing = false
  }
}

async function startUpload(itemId: string) {
  const item = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!item) return

  // 1. Init session (POST /api/v1/uploads/init)
  set_item_status(itemId, 'init', { startedAt: Date.now() })
  try {
    const initResp = await fetch('/api/v1/uploads/init?XTransformPort=3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: item.name,
        size: item.size,
        mime: item.mime,
        checksum: item.checksum,
        folderId: item.folderId,
        conflictResolution: item.conflictResolution || 'keep_both',
      }),
    })
    const initData = await initResp.json()
    if (!initData.success) throw new Error(initData.error || 'Init failed')
    set_item_status(itemId, 'uploading', { sessionId: initData.sessionId, storagePath: initData.storagePath })
  } catch (e) {
    set_item_status(itemId, 'failed', { error: (e as Error).message })
    return
  }

  // 2. Upload chunks in parallel
  await uploadChunks(itemId)
}

async function uploadChunks(itemId: string) {
  const item = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!item) return

  const pendingChunks = item.chunks.filter(c => c.status === 'pending' || c.status === 'failed')
  const streams = Math.min(item.parallelStreams, pendingChunks.length)

  // Process chunks in parallel batches
  let chunkQueue = [...pendingChunks]
  const inFlight: Promise<void>[] = []

  for (let s = 0; s < streams; s++) {
    inFlight.push(processChunkStream(itemId, chunkQueue))
  }
  await Promise.all(inFlight)

  // All chunks done — check final state
  const final = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!final) return
  if (final.status === 'paused' || final.status === 'cancelled') return

  const allDone = final.chunks.every(c => c.status === 'done')
  if (!allDone) {
    set_item_status(itemId, 'failed', { error: 'Some chunks failed after retries' })
    return
  }

  // 3. Scan with ClamAV (simulated)
  set_item_status(itemId, 'scanning')
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

  // 4. Complete (POST /api/v1/uploads/complete)
  set_item_status(itemId, 'completing')
  try {
    const completeResp = await fetch('/api/v1/uploads/complete?XTransformPort=3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: final.sessionId }),
    })
    const completeData = await completeResp.json()
    if (!completeData.success) throw new Error(completeData.error || 'Complete failed')

    set_item_status(itemId, 'completed', {
      completedAt: Date.now(),
      progress: 100,
      uploadedBytes: final.size,
      storagePath: completeData.storagePath,
    })

    // Emit completion event (for notifications + audit log)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cf-upload-complete', {
        detail: { item: final, fileId: completeData.fileId },
      }))
    }
  } catch (e) {
    set_item_status(itemId, 'failed', { error: (e as Error).message })
  }
}

async function processChunkStream(itemId: string, queue: UploadChunk[]) {
  while (queue.length > 0) {
    const item = useUploadEngine.getState().items.find(i => i.id === itemId)
    if (!item || item.status === 'paused' || item.status === 'cancelled') return

    const chunk = queue.shift()
    if (!chunk) return

    await uploadChunk(itemId, chunk)
  }
}

async function uploadChunk(itemId: string, chunk: UploadChunk) {
  const item = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!item) return

  // Mark chunk as uploading
  update_chunk(itemId, chunk.index, { status: 'uploading', attempts: chunk.attempts + 1 })

  // Simulate chunk upload with progress (real impl: fetch with chunk blob)
  const totalMs = 400 + Math.random() * 800
  const steps = 20
  const stepMs = totalMs / steps
  const startBytes = chunk.uploadedBytes
  const targetBytes = chunk.size

  for (let s = 1; s <= steps; s++) {
    const currentItem = useUploadEngine.getState().items.find(i => i.id === itemId)
    if (!currentItem || currentItem.status === 'paused' || currentItem.status === 'cancelled') return

    // 4% chance of chunk failure (simulates network issues) — auto-retry
    if (s === 10 && Math.random() < 0.04 && chunk.attempts < 3) {
      update_chunk(itemId, chunk.index, { status: 'failed' })
      set_item_status(itemId, 'chunk_failed')
      // Auto-retry after 500ms
      await new Promise(r => setTimeout(r, 500))
      update_chunk(itemId, chunk.index, { status: 'pending' })
      set_item_status(itemId, 'uploading')
      return uploadChunk(itemId, { ...chunk, attempts: chunk.attempts + 1 })
    }

    const uploaded = Math.round(targetBytes * (s / steps))
    update_chunk(itemId, chunk.index, { uploadedBytes: uploaded })
    updateItemProgress(itemId)
    await new Promise(r => setTimeout(r, stepMs))
  }

  // Chunk done
  update_chunk(itemId, chunk.index, { status: 'done', uploadedBytes: chunk.size })
  updateItemProgress(itemId)
}

function update_chunk(itemId: string, chunkIndex: number, patch: Partial<UploadChunk>) {
  useUploadEngine.setState(s => ({
    items: s.items.map(i => i.id === itemId ? {
      ...i,
      chunks: i.chunks.map(c => c.index === chunkIndex ? { ...c, ...patch } : c),
    } : i),
  }))
}

function updateItemProgress(itemId: string) {
  const item = useUploadEngine.getState().items.find(i => i.id === itemId)
  if (!item) return

  const totalUploaded = item.chunks.reduce((s, c) => s + c.uploadedBytes, 0)
  const progress = Math.min(100, (totalUploaded / item.size) * 100)
  const elapsed = item.startedAt ? (Date.now() - item.startedAt) / 1000 : 0
  const speed = elapsed > 0 ? totalUploaded / elapsed : 0
  const remaining = item.size - totalUploaded
  const eta = speed > 0 ? remaining / speed : 0

  useUploadEngine.setState(s => ({
    items: s.items.map(i => i.id === itemId ? {
      ...i,
      uploadedBytes: totalUploaded,
      progress,
      speed,
      eta,
    } : i),
  }))
}

// ----------------------------- Tick loop (refreshes ETA/speed) -----------------------------

if (typeof window !== 'undefined') {
  setInterval(() => {
    const items = useUploadEngine.getState().items
    let changed = false
    for (const item of items) {
      if (item.status === 'uploading' && item.startedAt) {
        updateItemProgress(item.id)
        changed = true
      }
    }
    // Try to process queue every tick
    if (useUploadEngine.getState().items.some(i => i.status === 'queued')) {
      processQueue()
    }
  }, 500)
}
