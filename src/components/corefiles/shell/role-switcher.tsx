'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ChevronUp, X } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import type { RoleKey } from '@/components/corefiles/data/menu'
import { cn } from '@/lib/utils'

const roles: RoleKey[] = [
  'Super Admin', 'Admin', 'Manager', 'Department Head', 'Employee', 'Read Only', 'Guest',
]

const roleColors: Record<RoleKey, string> = {
  'Super Admin': '#dc2626',
  'Admin': '#7c3aed',
  'Manager': '#0ea5e9',
  'Department Head': '#10b981',
  'Employee': '#f59e0b',
  'Read Only': '#64748b',
  'Guest': '#94a3b8',
}

/** Floating demo widget — switch role to preview permission-based menu changes. */
export function RoleSwitcher() {
  const { user, setRole, isAuthed } = useApp()
  const [open, setOpen] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)

  if (!isAuthed || !user) return null

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="glass-nav fixed bottom-6 left-6 z-40 hidden w-64 overflow-hidden rounded-2xl md:block"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Preview
              </span>
            </div>
            <div className="flex gap-0.5">
              <button
                onClick={() => setOpen(o => !o)}
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label={open ? 'Collapse' : 'Expand'}
              >
                <ChevronUp size={12} className={cn('transition-transform', open && 'rotate-180')} />
              </button>
              <button
                onClick={() => setHidden(true)}
                className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label="Hide"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 p-2">
                  <p className="px-2 py-1 text-[10px] text-muted-foreground">
                    Switch role to see how the menu rebuilds itself based on permissions:
                  </p>
                  {roles.map(r => {
                    const active = user.role === r
                    return (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors',
                          active ? 'bg-accent font-medium' : 'hover:bg-accent/60',
                        )}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ background: roleColors[r] }} />
                        <span className="flex-1">{r}</span>
                        {active && <span className="text-[9px] text-primary">active</span>}
                      </button>
                    )
                  })}
                </div>
                <div className="border-t border-border/60 px-3 py-2 text-[9px] text-muted-foreground">
                  In production, this is driven by <code className="rounded bg-muted px-1 py-0.5">role_menu_permissions</code> table.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
