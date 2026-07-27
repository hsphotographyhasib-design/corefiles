'use client'

import { useEffect } from 'react'
import { toast as sonnerToast } from 'sonner'
import { useApp } from '@/lib/corefiles/store'

/** Listens for `cf-toast` custom events and forwards them to Sonner. */
export function ToastBridge() {
  useEffect(() => {
    const handler = (e: Event) => {
      const { msg, variant } = (e as CustomEvent).detail as {
        msg: string
        variant?: 'success' | 'error' | 'info'
      }
      if (variant === 'error') sonnerToast.error(msg)
      else if (variant === 'info') sonnerToast.info(msg)
      else sonnerToast.success(msg)
    }
    window.addEventListener('cf-toast', handler)
    return () => window.removeEventListener('cf-toast', handler)
  }, [])
  return null
}

export function toast(msg: string, variant: 'success' | 'error' | 'info' = 'success') {
  useApp.getState().toast(msg, variant)
}
