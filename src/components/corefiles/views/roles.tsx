'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Plus, Check, X, Lock, Users as UsersIcon, Pencil, Save,
  Info, AlertTriangle,
} from 'lucide-react'
import { roles, allPermissions, users } from '@/components/corefiles/data/mock'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'

export function RolesView() {
  const [selectedRole, setSelectedRole] = React.useState(roles[0].id)
  const [editing, setEditing] = React.useState(false)
  const [permMatrix, setPermMatrix] = React.useState<Record<string, Set<string>>>(
    Object.fromEntries(roles.map(r => [r.id, new Set(r.permissions)]))
  )

  const role = roles.find(r => r.id === selectedRole)!
  const roleUsers = users.filter(u => u.role === role.name)

  const togglePerm = (perm: string) => {
    if (role.isSystem && role.name === 'Super Admin') {
      toast('Super Admin permissions cannot be modified', 'error')
      return
    }
    setPermMatrix(prev => {
      const next = { ...prev }
      const set = new Set(next[selectedRole])
      if (set.has(perm)) set.delete(perm); else set.add(perm)
      next[selectedRole] = set
      return next
    })
  }

  const save = () => {
    setEditing(false)
    toast(`Role "${role.name}" updated successfully`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield size={18} className="text-primary" /> Roles & Permissions
          </h2>
          <p className="text-xs text-muted-foreground">
            Configure what each role can do. Changes are recorded in the audit log.
          </p>
        </div>
        <button onClick={() => toast('New role dialog opened')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
          <Plus size={14} /> Create role
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Role list */}
        <div className="glass shadow-float rounded-2xl p-3">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</h3>
          <div className="space-y-1">
            {roles.map(r => {
              const active = selectedRole === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => { setSelectedRole(r.id); setEditing(false) }}
                  className={cn(
                    'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors',
                    active ? 'bg-primary/10' : 'hover:bg-accent/60'
                  )}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${r.color}20`, color: r.color }}>
                    <Shield size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-xs font-semibold">
                      {r.name}
                      {r.isSystem && <Lock size={10} className="text-muted-foreground" />}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.userCount} users</p>
                  </div>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Permission matrix */}
        <div className="glass shadow-float rounded-2xl p-5">
          {/* Role header */}
          <div className="mb-4 flex items-start justify-between border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${role.color}20`, color: role.color }}>
                  <Shield size={16} />
                </span>
                <div>
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    {role.name}
                    {role.isSystem && <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium uppercase">System</span>}
                  </h3>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-muted/40 px-3 py-1.5 text-center">
                <p className="text-[10px] text-muted-foreground">Users</p>
                <p className="text-sm font-bold">{roleUsers.length}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-3 py-1.5 text-center">
                <p className="text-[10px] text-muted-foreground">Permissions</p>
                <p className="text-sm font-bold">{permMatrix[role.id].size}/{allPermissions.length}</p>
              </div>
              {editing ? (
                <button onClick={save} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600">
                  <Save size={13} /> Save
                </button>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  disabled={role.name === 'Super Admin'}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow disabled:opacity-50"
                >
                  <Pencil size={13} /> Edit
                </button>
              )}
            </div>
          </div>

          {role.name === 'Super Admin' && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle size={14} /> Super Admin has unrestricted access and cannot be modified.
            </div>
          )}

          {/* Permissions grid */}
          <div className="grid gap-2 sm:grid-cols-2">
            {allPermissions.map(perm => {
              const enabled = permMatrix[role.id].has(perm.key)
              return (
                <button
                  key={perm.key}
                  onClick={() => editing && togglePerm(perm.key)}
                  disabled={!editing || role.name === 'Super Admin'}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                    enabled ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/40',
                    editing && role.name !== 'Super Admin' && 'cursor-pointer hover:border-primary/60',
                  )}
                >
                  <div className={cn(
                    'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                    enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {enabled ? <Check size={14} /> : <X size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">{perm.label}</p>
                    <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Users with this role */}
          <div className="mt-5 border-t border-border/60 pt-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <UsersIcon size={12} /> Users with this role
            </h4>
            <div className="flex flex-wrap gap-2">
              {roleUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No users assigned to this role.</p>
              ) : roleUsers.map(u => (
                <div key={u.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-2 py-1.5">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="text-xs">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
