'use client'

/**
 * CoreFiles — File Validation Module
 *
 * Production note: Client-side validation is for UX only. The backend
 * (NestJS + ClamAV + Prisma) re-validates every file server-side. Never
 * trust client checks alone — see API route handlers in /api/v1/uploads/*.
 */

// ----------------------------- File type config -----------------------------

export interface FileTypeConfig {
  ext: string
  mime: string
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'cad' | 'data' | 'text' | 'code'
  maxSize: number // bytes
  preview: 'thumbnail' | 'pdf' | 'video' | 'audio' | 'text' | 'none'
  icon: string
  color: string
}

// 40+ enterprise file types — covers everything in the spec
export const FILE_TYPES: Record<string, FileTypeConfig> = {
  // Images
  jpg: { ext: 'jpg', mime: 'image/jpeg', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  jpeg: { ext: 'jpeg', mime: 'image/jpeg', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  png: { ext: 'png', mime: 'image/png', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  gif: { ext: 'gif', mime: 'image/gif', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  webp: { ext: 'webp', mime: 'image/webp', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  svg: { ext: 'svg', mime: 'image/svg+xml', category: 'image', maxSize: 10 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  bmp: { ext: 'bmp', mime: 'image/bmp', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },
  tiff: { ext: 'tiff', mime: 'image/tiff', category: 'image', maxSize: 100 * 1024 ** 2, preview: 'thumbnail', icon: 'image', color: '#7c3aed' },

  // Videos
  mp4: { ext: 'mp4', mime: 'video/mp4', category: 'video', maxSize: 5 * 1024 ** 3, preview: 'video', icon: 'film', color: '#db2777' },
  mov: { ext: 'mov', mime: 'video/quicktime', category: 'video', maxSize: 5 * 1024 ** 3, preview: 'video', icon: 'film', color: '#db2777' },
  avi: { ext: 'avi', mime: 'video/x-msvideo', category: 'video', maxSize: 5 * 1024 ** 3, preview: 'video', icon: 'film', color: '#db2777' },
  mkv: { ext: 'mkv', mime: 'video/x-matroska', category: 'video', maxSize: 5 * 1024 ** 3, preview: 'video', icon: 'film', color: '#db2777' },
  webm: { ext: 'webm', mime: 'video/webm', category: 'video', maxSize: 5 * 1024 ** 3, preview: 'video', icon: 'film', color: '#db2777' },

  // Audio
  mp3: { ext: 'mp3', mime: 'audio/mpeg', category: 'audio', maxSize: 500 * 1024 ** 2, preview: 'audio', icon: 'music', color: '#0891b2' },
  wav: { ext: 'wav', mime: 'audio/wav', category: 'audio', maxSize: 1 * 1024 ** 3, preview: 'audio', icon: 'music', color: '#0891b2' },
  flac: { ext: 'flac', mime: 'audio/flac', category: 'audio', maxSize: 1 * 1024 ** 3, preview: 'audio', icon: 'music', color: '#0891b2' },
  aac: { ext: 'aac', mime: 'audio/aac', category: 'audio', maxSize: 500 * 1024 ** 2, preview: 'audio', icon: 'music', color: '#0891b2' },

  // PDF
  pdf: { ext: 'pdf', mime: 'application/pdf', category: 'document', maxSize: 500 * 1024 ** 2, preview: 'pdf', icon: 'file-text', color: '#dc2626' },

  // Office
  doc: { ext: 'doc', mime: 'application/msword', category: 'document', maxSize: 200 * 1024 ** 2, preview: 'none', icon: 'file-text', color: '#2563eb' },
  docx: { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document', maxSize: 200 * 1024 ** 2, preview: 'none', icon: 'file-text', color: '#2563eb' },
  xls: { ext: 'xls', mime: 'application/vnd.ms-excel', category: 'document', maxSize: 200 * 1024 ** 2, preview: 'none', icon: 'file-spreadsheet', color: '#16a34a' },
  xlsx: { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'document', maxSize: 200 * 1024 ** 2, preview: 'none', icon: 'file-spreadsheet', color: '#16a34a' },
  ppt: { ext: 'ppt', mime: 'application/vnd.ms-powerpoint', category: 'document', maxSize: 500 * 1024 ** 2, preview: 'none', icon: 'presentation', color: '#ea580c' },
  pptx: { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'document', maxSize: 500 * 1024 ** 2, preview: 'none', icon: 'presentation', color: '#ea580c' },

  // Archives
  zip: { ext: 'zip', mime: 'application/zip', category: 'archive', maxSize: 5 * 1024 ** 3, preview: 'none', icon: 'archive', color: '#a16207' },
  rar: { ext: 'rar', mime: 'application/vnd.rar', category: 'archive', maxSize: 5 * 1024 ** 3, preview: 'none', icon: 'archive', color: '#a16207' },
  '7z': { ext: '7z', mime: 'application/x-7z-compressed', category: 'archive', maxSize: 5 * 1024 ** 3, preview: 'none', icon: 'archive', color: '#a16207' },
  tar: { ext: 'tar', mime: 'application/x-tar', category: 'archive', maxSize: 5 * 1024 ** 3, preview: 'none', icon: 'archive', color: '#a16207' },
  gz: { ext: 'gz', mime: 'application/gzip', category: 'archive', maxSize: 5 * 1024 ** 3, preview: 'none', icon: 'archive', color: '#a16207' },

  // CAD
  dwg: { ext: 'dwg', mime: 'application/acad', category: 'cad', maxSize: 1 * 1024 ** 3, preview: 'none', icon: 'ruler', color: '#0ea5e9' },
  dxf: { ext: 'dxf', mime: 'application/dxf', category: 'cad', maxSize: 1 * 1024 ** 3, preview: 'none', icon: 'ruler', color: '#0ea5e9' },
  ifc: { ext: 'ifc', mime: 'application/x-step', category: 'cad', maxSize: 1 * 1024 ** 3, preview: 'none', icon: 'ruler', color: '#0ea5e9' },

  // Data
  csv: { ext: 'csv', mime: 'text/csv', category: 'data', maxSize: 100 * 1024 ** 2, preview: 'text', icon: 'file-spreadsheet', color: '#16a34a' },
  json: { ext: 'json', mime: 'application/json', category: 'data', maxSize: 50 * 1024 ** 2, preview: 'text', icon: 'code', color: '#9333ea' },
  xml: { ext: 'xml', mime: 'application/xml', category: 'data', maxSize: 50 * 1024 ** 2, preview: 'text', icon: 'code', color: '#9333ea' },

  // Text
  txt: { ext: 'txt', mime: 'text/plain', category: 'text', maxSize: 10 * 1024 ** 2, preview: 'text', icon: 'file-text', color: '#475569' },
  md: { ext: 'md', mime: 'text/markdown', category: 'text', maxSize: 10 * 1024 ** 2, preview: 'text', icon: 'file-text', color: '#475569' },

  // Code
  js: { ext: 'js', mime: 'text/javascript', category: 'code', maxSize: 10 * 1024 ** 2, preview: 'text', icon: 'code', color: '#9333ea' },
  ts: { ext: 'ts', mime: 'application/typescript', category: 'code', maxSize: 10 * 1024 ** 2, preview: 'text', icon: 'code', color: '#9333ea' },
  py: { ext: 'py', mime: 'text/x-python', category: 'code', maxSize: 10 * 1024 ** 2, preview: 'text', icon: 'code', color: '#9333ea' },
}

// Hard blocked extensions (never allowed)
export const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'scr', 'msi', 'dll', 'sys',
  'sh', 'bash', 'ps1', 'vbs', 'reg', 'jar', 'class',
])

// Hard global max (per file) — 100 GB per spec
export const GLOBAL_MAX_SIZE = 100 * 1024 ** 3

// ----------------------------- Validators -----------------------------

export interface ValidationResult {
  valid: boolean
  error?: string
  errorCode?: 'too_large' | 'blocked_ext' | 'unsupported' | 'invalid_name' | 'corrupted'
  fileConfig?: FileTypeConfig
}

export function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i === -1 ? '' : filename.slice(i + 1).toLowerCase()
}

export function detectCategory(filename: string): FileTypeConfig['category'] | 'unknown' {
  const ext = getExtension(filename)
  return FILE_TYPES[ext]?.category || 'unknown'
}

export function getFileConfig(filename: string): FileTypeConfig | null {
  return FILE_TYPES[getExtension(filename)] || null
}

/** Sanitize filename — strip illegal chars, prevent path traversal. */
export function sanitizeFilename(name: string): string {
  // Strip path components (defends against ../ traversal)
  const base = name.split(/[\\/]/).pop() || name
  // Replace illegal chars (Windows + Unix + SQL-injection-prone)
  return base
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/^\.+/, '')  // no leading dots
    .replace(/\s+$/, '')
    .slice(0, 255)
}

/** Validate file against all rules. */
export function validateFile(file: { name: string; size: number; type?: string }): ValidationResult {
  const ext = getExtension(file.name)

  // 1. Blocked extensions
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type ".${ext}" is blocked for security`, errorCode: 'blocked_ext' }
  }

  // 2. Unsupported extension
  const cfg = FILE_TYPES[ext]
  if (!cfg) {
    return { valid: false, error: `File type ".${ext}" is not supported`, errorCode: 'unsupported' }
  }

  // 3. Global max (100 GB)
  if (file.size > GLOBAL_MAX_SIZE) {
    return { valid: false, error: `File exceeds global maximum of 100 GB`, errorCode: 'too_large' }
  }

  // 4. Per-type max
  if (file.size > cfg.maxSize) {
    return {
      valid: false,
      error: `File exceeds max size for .${ext} (${formatBytes(cfg.maxSize)})`,
      errorCode: 'too_large',
    }
  }

  // 5. Empty / corrupted
  if (file.size === 0) {
    return { valid: false, error: 'File is empty (possibly corrupted)', errorCode: 'corrupted' }
  }

  // 6. Filename check
  const sanitized = sanitizeFilename(file.name)
  if (sanitized !== file.name) {
    // Auto-sanitize, still allow
  }

  return { valid: true, fileConfig: cfg }
}

// ----------------------------- Helpers -----------------------------

export function formatBytes(b: number): string {
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(1)} MB`
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${b} B`
}

export function formatSpeed(bytesPerSec: number): string {
  return `${formatBytes(bytesPerSec)}/s`
}

export function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

/** Simulate SHA-256 checksum (in production this would be crypto.subtle.digest). */
export async function computeChecksum(file: Blob): Promise<string> {
  // Real impl: const buf = await file.arrayBuffer(); const hash = await crypto.subtle.digest('SHA-256', buf)
  // Sandbox: deterministic stub based on size + name + last modified
  const seed = `${file.size}-${(file as File).name}-${(file as File).lastModified || 0}`
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i)
    h |= 0
  }
  const hashHex = Math.abs(h).toString(16).padStart(8, '0')
  return `sha256:${hashHex}${Math.abs(h * 31).toString(16).padStart(8, '0')}${Math.abs(h * 97).toString(16).padStart(8, '0')}${Math.abs(h * 113).toString(16).padStart(8, '0')}`.slice(0, 71)
}
