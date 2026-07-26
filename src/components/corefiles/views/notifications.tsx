'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCheck, Filter, CheckCircle2, AlertTriangle, ShieldAlert,
  Info, FileText, Share2, Upload, Lock, Server, Clock, X,
} from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'
import { userById, type NotificationItem } from '@/components/corefiles/data/mock'
import { Avatar } from '@/components/corefiles/common/avatar'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

const severityMap = {
  info: { icon: Info, color: 'text-sky-500 bg-sky-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
  critical: { icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10' },
}

const typeIcon: Record<NotificationItem['type'], React.ComponentType<{ size?: number }>> = {
  file_uploaded: Upload,
  file_shared: Share2,
  permission_changed: Lock,
  storage_almost_full: AlertTriangle,
  server_offline: Server,
  login_detected: Bell,
  failed_login: ShieldAlert,
  approval_request: Clock,
  approval_completed: CheckCircle2,
  comment_added: FileText,
  version_created: FileText,
}

export function NotificationsView() {
  const { notifications, markAllRead, markNotificationRead, toast } = useApp()
  const [filter, setFilter] = React.useState<'all' | 'unread' | 'critical'>('all')

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'critical') return n.severity === 'critical'
    return true
  })

  const unread = notifications.filter(n => !n.read).length
  const critical = notifications.filter(n => n.severity === 'critical').length

  return (
    <div className="space-y-4">
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell size={18} className="text-primary" /> Notifications
            {unread > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">{unread} unread</span>}
          </h2>
          <p className="text-xs text-muted-foreground">Real-time alerts on file activity, security, and approvals.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            {(['all', 'unread', 'critical'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}{f === 'unread' && unread > 0 ? ` (${unread})` : f === 'critical' && critical > 0 ? ` (${critical})` : ''}
              </button>
            ))}
          </div>
          <button onClick={() => { markAllRead(); toast('All notifications marked as read') }} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>
      </div>

      <div className="glass shadow-float rounded-2xl p-2">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const sev = severityMap[n.severity]
            const TypeIcon = typeIcon[n.type]
            const actor = n.actorId ? userById(n.actorId) : null
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-accent/40',
                  !n.read && 'bg-primary/5'
                )}
              >
                <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', sev.color)}>
                  <TypeIcon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.description}</p>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    {actor && (
                      <div className="flex items-center gap-1">
                        <Avatar name={actor.name} size={14} />
                        <span>{actor.name}</span>
                      </div>
                    )}
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</span>
                    <span>·</span>
                    <span className="capitalize">{n.severity}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!n.read && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-primary"
                      title="Mark as read"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => toast('Notification dismissed')}
                    className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-rose-500"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Bell size={32} className="mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground">No {filter !== 'all' ? filter + ' ' : ''}notifications to show.</p>
          </div>
        )}
      </div>

      <div className="glass shadow-float rounded-2xl p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Filter size={12} /> Notification preferences
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(typeIcon).slice(0, 8).map(([type, Icon]) => (
            <label key={type} className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-primary" />
              <Icon size={14} />
              <span className="flex-1 text-xs capitalize">{type.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
