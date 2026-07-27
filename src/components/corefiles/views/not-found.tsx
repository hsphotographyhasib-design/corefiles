'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Compass, Home, Search, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { toast } from '@/components/corefiles/common/toast-bridge'

/**
 * NotFoundView — shown when:
 *   1. The user navigates to an invalid route (e.g. /unknown-page)
 *   2. The user tries to access a view they don't have permission for
 *
 * Provides clear actions: go home, search, go back, or contact support.
 */
export function NotFoundView({ variant = 'not-found' }: { variant?: 'not-found' | 'permission-denied' }) {
  const { setView, setQuickFind } = useApp()

  const isPermission = variant === 'permission-denied'

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="glass cf-lift shadow-float max-w-lg rounded-3xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
          className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl"
          style={{
            background: isPermission ? 'rgba(244,63,94,0.10)' : 'rgba(14,165,233,0.10)',
            color: isPermission ? '#f43f5e' : '#0ea5e9',
          }}
        >
          {isPermission ? <ShieldAlert size={28} /> : <Compass size={28} />}
        </motion.div>

        <h1 className="text-3xl font-bold">{isPermission ? '403' : '404'}</h1>
        <h2 className="mt-1 text-base font-semibold">
          {isPermission ? 'Permission denied' : 'Page not found'}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPermission
            ? "You don't have permission to access this page. Contact your administrator if you believe this is an error."
            : "The page you're looking for doesn't exist or has been moved. Try searching or return to the dashboard."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { setView('dashboard'); toast('Returning to Dashboard') }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
          >
            <Home size={14} /> Dashboard
          </button>
          <button
            onClick={() => setQuickFind(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Search size={14} /> Search (⌘K)
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <ArrowLeft size={14} /> Go back
          </button>
          <button
            onClick={() => { setView('support'); toast('Opening Support') }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <RefreshCw size={14} /> Contact support
          </button>
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground/70">
          Error code: {isPermission ? 'CF-403-PERM' : 'CF-404-NF'} · Reference: {Math.random().toString(36).slice(2, 10).toUpperCase()}
        </p>
      </motion.div>
    </div>
  )
}
