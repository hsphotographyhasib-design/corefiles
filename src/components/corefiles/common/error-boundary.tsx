'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { toast } from '@/components/corefiles/common/toast-bridge'

interface Props {
  children: React.ReactNode
  view?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * ErrorBoundary — catches runtime errors during view rendering and shows
 * a professional error UI instead of a blank screen.
 *
 * Each view is wrapped in its own ErrorBoundary so a single view crashing
 * doesn't take down the entire app shell.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CoreFiles ErrorBoundary]', error, info)
    toast('Something went wrong loading this view', 'error')
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback
        error={this.state.error}
        view={this.props.view}
        onRetry={() => this.setState({ hasError: false, error: undefined })}
      />
    }
    return this.props.children
  }
}

function ErrorFallback({ error, view, onRetry }: { error?: Error; view?: string; onRetry: () => void }) {
  const { setView } = useApp()
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        className="glass cf-lift shadow-float max-w-lg rounded-3xl p-8 text-center"
      >
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertTriangle size={28} />
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We encountered an unexpected error while loading{view ? ` the ${view} view` : ' this page'}.
          Please try again — your data is safe.
        </p>
        {error?.message && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-muted/60 p-3 text-left text-[10px] font-mono text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
          >
            <RefreshCw size={14} /> Try again
          </button>
          <button
            onClick={() => { setView('dashboard'); onRetry() }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Home size={14} /> Dashboard
          </button>
        </div>
        <p className="mt-6 text-[10px] text-muted-foreground/70">
          Error reference: {Date.now().toString(36).toUpperCase()}
        </p>
      </motion.div>
    </div>
  )
}
