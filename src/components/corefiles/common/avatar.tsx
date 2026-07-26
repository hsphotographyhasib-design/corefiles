'use client'

import { initials } from '@/components/corefiles/data/mock'
import { cn } from '@/lib/utils'

const palette = [
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-sky-500 to-blue-600',
  'bg-gradient-to-br from-violet-500 to-purple-600',
  'bg-gradient-to-br from-rose-500 to-pink-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-cyan-500 to-teal-600',
  'bg-gradient-to-br from-fuchsia-500 to-pink-600',
]

export function Avatar({
  name,
  size = 36,
  className,
  online = false,
}: {
  name: string
  size?: number
  className?: string
  online?: boolean
}) {
  const idx = name.charCodeAt(0) % palette.length
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <div
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full text-white font-semibold shadow-sm ring-2 ring-background',
          palette[idx]
        )}
        style={{ fontSize: size * 0.38 }}
      >
        {initials(name)}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background pulse-dot text-emerald-500" />
      )}
    </div>
  )
}
