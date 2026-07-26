'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Users as UsersIcon, UserPlus, Search, MoreHorizontal, Shield, Mail,
  Building2, Clock, Filter, Download, Upload, Ban, CheckCircle2, Pencil, Trash2,
  KeyRound, ChevronDown,
} from 'lucide-react'
import { users, departments, roles, fmtBytes } from '@/components/corefiles/data/mock'
import { Avatar } from '@/components/corefiles/common/avatar'
import { useApp } from '@/lib/corefiles/store'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const statusColor = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  suspended: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  invited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

export function UsersView() {
  const { toast: _t } = useApp()
  const [query, setQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [deptFilter, setDeptFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState('all')

  const filtered = users.filter(u => {
    if (query && !u.name.toLowerCase().includes(query.toLowerCase()) && !u.email.toLowerCase().includes(query.toLowerCase())) return false
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (deptFilter !== 'all' && u.departmentId !== deptFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total users', value: users.length, icon: UsersIcon, color: 'from-emerald-500 to-teal-600' },
          { label: 'Active (24h)', value: users.filter(u => Date.now() - new Date(u.lastActive).getTime() < 86400000).length, icon: CheckCircle2, color: 'from-sky-500 to-blue-600' },
          { label: '2FA enabled', value: users.filter(u => u.twoFactor).length, icon: Shield, color: 'from-violet-500 to-purple-600' },
          { label: 'Suspended', value: users.filter(u => u.status === 'suspended').length, icon: Ban, color: 'from-rose-500 to-pink-600' },
        ].map(s => (
          <div key={s.label} className="glass cf-lift-sm shadow-float rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white', s.color)}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="glass shadow-float rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="h-9 w-full rounded-lg border border-border bg-background/60 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-background/60 px-3 text-xs">
            <option value="all">All roles</option>
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-background/60 px-3 text-xs">
            <option value="all">All departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-background/60 px-3 text-xs">
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="invited">Invited</option>
          </select>
          <button onClick={() => toast('Exporting user list…')} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => toast('Invite dialog opened')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
            <UserPlus size={13} /> Invite user
          </button>
        </div>
      </div>

      {/* User table */}
      <div className="glass shadow-float overflow-hidden rounded-2xl">
        <div className="cf-scroll overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">Department</th>
                <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold lg:table-cell">2FA</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Storage</th>
                <th className="hidden px-4 py-3 text-left font-semibold xl:table-cell">Last active</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const dept = departments.find(d => d.id === u.departmentId)
                const role = roles.find(r => r.name === u.role)
                return (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-t border-border/40 hover:bg-accent/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size={36} online={Date.now() - new Date(u.lastActive).getTime() < 600000} />
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md px-2 py-0.5 text-[10px] font-medium" style={{ background: `${role?.color}20`, color: role?.color }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: dept?.color }} />
                        <span className="text-xs">{dept?.name}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-medium capitalize', statusColor[u.status])}>
                        {u.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {u.twoFactor ? <CheckCircle2 size={14} className="text-emerald-500" /> : <span className="text-[10px] text-muted-foreground">Disabled</span>}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (u.storageUsedBytes / (50 * 1024 ** 3)) * 100)}%` }} />
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtBytes(u.storageUsedBytes)}</p>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {formatDistanceToNow(new Date(u.lastActive), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toast(`Reset password link sent to ${u.email}`)} title="Reset password" className="rounded-md p-1.5 hover:bg-accent">
                          <KeyRound size={14} />
                        </button>
                        <button onClick={() => toast(`Editing ${u.name}`)} title="Edit" className="rounded-md p-1.5 hover:bg-accent">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => toast(`${u.status === 'suspended' ? 'Activated' : 'Suspended'} ${u.name}`, 'info')} title={u.status === 'suspended' ? 'Activate' : 'Suspend'} className="rounded-md p-1.5 hover:bg-accent">
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium">No users match your filters</p>
            <p className="text-xs text-muted-foreground">Try adjusting search or filters</p>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {users.length} users</span>
          <div className="flex gap-1">
            <button className="rounded-md px-2 py-1 hover:bg-accent">←</button>
            <button className="rounded-md bg-primary px-2 py-1 text-primary-foreground">1</button>
            <button className="rounded-md px-2 py-1 hover:bg-accent">2</button>
            <button className="rounded-md px-2 py-1 hover:bg-accent">→</button>
          </div>
        </div>
      </div>
    </div>
  )
}
