'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, X, Crop, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ImageCropper — modal component for cropping profile pictures.
 *
 * Features:
 *   - Square crop area with circle preview (matches avatar shape)
 *   - Zoom in/out (1x to 3x)
 *   - Rotate left/right (90° increments)
 *   - Drag to reposition the image within the crop area
 *   - Live circle preview (updates as you adjust)
 *   - Returns a cropped + compressed WebP blob
 */
export function ImageCropper({
  file,
  onSave,
  onCancel,
}: {
  file: File
  onSave: (croppedBlob: Blob, dataUrl: string) => void
  onCancel: () => void
}) {
  const [imageSrc, setImageSrc] = React.useState<string>('')
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number; posX: number; posY: number } | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const imageRef = React.useRef<HTMLImageElement | null>(null)

  // Load the image file as a data URL
  React.useEffect(() => {
    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
  }, [file])

  // Handle drag to reposition
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragStart({ x: e.clientX, y: e.clientY, posX: position.x, posY: position.y })
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    setPosition({ x: dragStart.posX + dx, y: dragStart.posY + dy })
  }
  const onPointerUp = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setDragStart(null)
  }

  // Generate the cropped image
  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 512 // output size
    canvas.width = size
    canvas.height = size

    // Draw the image with zoom + rotation + position offset
    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)

    // Calculate image draw dimensions to cover the crop area
    const img = imageRef.current
    const imgAspect = img.naturalWidth / img.naturalHeight
    let drawW = size
    let drawH = size
    if (imgAspect > 1) {
      drawW = size * imgAspect
    } else {
      drawH = size / imgAspect
    }

    // Apply position offset (normalized to canvas size)
    ctx.drawImage(
      img,
      -drawW / 2 + position.x / zoom,
      -drawH / 2 + position.y / zoom,
      drawW,
      drawH,
    )
    ctx.restore()

    // Convert to blob (WebP for smaller size, fallback to PNG)
    canvas.toBlob((blob) => {
      if (!blob) return
      const dataUrl = canvas.toDataURL('image/webp', 0.9)
      onSave(blob, dataUrl)
    }, 'image/webp', 0.9)
  }

  const reset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="glass-nav w-full max-w-md overflow-hidden rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Crop size={16} className="text-primary" /> Crop Profile Picture
          </h3>
          <button onClick={onCancel} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent">
            <X size={14} />
          </button>
        </div>

        {/* Crop area */}
        <div className="p-5">
          <div className="relative mx-auto grid h-64 w-64 place-items-center overflow-hidden rounded-2xl bg-muted">
            {imageSrc && (
              <img
                ref={imageRef}
                src={imageSrc}
                alt="To crop"
                draggable={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="max-w-none select-none touch-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: dragStart ? 'none' : 'transform 0.1s',
                  cursor: dragStart ? 'grabbing' : 'grab',
                  height: '256px',
                }}
              />
            )}
            {/* Crop overlay — square with circle guide */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-4 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
              <div className="absolute inset-4 rounded-full border-2 border-white/40" />
              {/* Grid lines */}
              <div className="absolute inset-4">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/30" />
                <div className="absolute top-1/3 left-0 h-px w-full bg-white/30" />
                <div className="absolute top-2/3 left-0 h-px w-full bg-white/30" />
              </div>
            </div>
          </div>

          {/* Live circle preview */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[10px] text-muted-foreground">Preview:</span>
            <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-border">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Preview"
                  className="max-w-none"
                  style={{
                    transform: `translate(${position.x * 0.1875}px, ${position.y * 0.1875}px) scale(${zoom}) rotate(${rotation}deg)`,
                    height: '64px',
                  }}
                />
              )}
            </div>
            <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-border">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Preview small"
                  className="max-w-none"
                  style={{
                    transform: `translate(${position.x * 0.125}px, ${position.y * 0.125}px) scale(${zoom}) rotate(${rotation}deg)`,
                    height: '42px',
                  }}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <button
              onClick={() => setZoom(z => Math.max(1, z - 0.2))}
              disabled={zoom <= 1}
              className="flex flex-col items-center gap-1 rounded-lg border border-border/60 p-2 text-[10px] hover:bg-accent disabled:opacity-40"
            >
              <ZoomOut size={14} /> Zoom Out
            </button>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              disabled={zoom >= 3}
              className="flex flex-col items-center gap-1 rounded-lg border border-border/60 p-2 text-[10px] hover:bg-accent disabled:opacity-40"
            >
              <ZoomIn size={14} /> Zoom In
            </button>
            <button
              onClick={() => setRotation(r => r - 90)}
              className="flex flex-col items-center gap-1 rounded-lg border border-border/60 p-2 text-[10px] hover:bg-accent"
            >
              <RotateCcw size={14} /> Rotate L
            </button>
            <button
              onClick={() => setRotation(r => r + 90)}
              className="flex flex-col items-center gap-1 rounded-lg border border-border/60 p-2 text-[10px] hover:bg-accent"
            >
              <RotateCw size={14} /> Rotate R
            </button>
          </div>

          {/* Zoom slider */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Zoom</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={e => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="w-10 text-right text-[10px] font-medium">{zoom.toFixed(1)}x</span>
          </div>

          {/* Drag hint */}
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Drag the image to reposition · Use controls to adjust
          </p>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              <RefreshCw size={13} /> Reset
            </button>
            <button
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:shadow-glow"
            >
              <Check size={14} /> Apply & Upload
            </button>
          </div>
        </div>

        {/* Hidden canvas for rendering the cropped output */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  )
}
