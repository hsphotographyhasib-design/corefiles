'use client'

import { Boxes } from 'lucide-react'
import { BUILD_INFO, ATTRIBUTION } from '@/lib/corefiles/build-info'
import { useApp } from '@/lib/corefiles/store'

/**
 * Footer — small professional footer with ownership attribution.
 *
 * Spec:
 *   CoreFiles Enterprise
 *   © Hasanur Jaya Sdn. Bhd.
 *   Developed by amdsaib96
 */
export function Footer() {
  const { setView, setBreadcrumbs } = useApp()
  return (
    <footer className="mt-8 flex flex-col items-center justify-between gap-2 rounded-2xl border border-border/40 bg-card/30 px-4 py-3 text-center text-[10px] text-muted-foreground sm:flex-row sm:text-left">
      <div className="flex items-center gap-1.5">
        <Boxes size={12} className="text-primary" />
        <span className="font-semibold">{BUILD_INFO.appName} Enterprise</span>
        <span className="text-muted-foreground/60">v{BUILD_INFO.version}</span>
      </div>
      <p>{ATTRIBUTION}</p>
      <button
        onClick={() => { setView('about'); setBreadcrumbs([{ label: 'About CoreFiles', view: 'about' }]) }}
        className="font-medium text-primary hover:underline"
      >
        About
      </button>
    </footer>
  )
}
