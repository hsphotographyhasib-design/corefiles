'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Building2, Plus, Folder, Users as UsersIcon, HardDrive, Pencil,
  ChevronRight, ChevronDown, MoreHorizontal,
} from 'lucide-react'
import { departments, users, fmtBytes } from '@/components/corefiles/data/mock'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'

const iconFor = (icon?: string) => {
  // For demo we just use Building2 / Folder based on icon name
  return icon === 'folder' ? Folder : Building2
}

export function DepartmentsView() {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const toggle = (id: string) => setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Building2 size={18} className="text-primary" /> Departments
          </h2>
          <p className="text-xs text-muted-foreground">
            Organization structure mirrors the company folder hierarchy.
          </p>
        </div>
        <button onClick={() => toast('New department dialog opened')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
          <Plus size={14} /> Add department
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total departments', value: departments.length, icon: Building2, color: 'from-emerald-500 to-teal-600' },
          { label: 'Total members', value: users.length, icon: UsersIcon, color: 'from-sky-500 to-blue-600' },
          { label: 'Total storage quota', value: `${(departments.reduce((s, d) => s + d.storageQuotaBytes, 0) / 1024 ** 3).toFixed(0)} GB`, icon: HardDrive, color: 'from-amber-500 to-orange-600' },
          { label: 'Avg utilization', value: `${Math.round(departments.reduce((s, d) => s + d.storageUsedBytes / d.storageQuotaBytes, 0) / departments.length * 100)}%`, icon: HardDrive, color: 'from-violet-500 to-purple-600' },
        ].map(s => (
          <div key={s.label} className="glass shadow-float rounded-2xl p-4">
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

      {/* Department list */}
      <div className="glass shadow-float overflow-hidden rounded-2xl">
        <div className="border-b border-border/60 bg-muted/40 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company org structure</h3>
        </div>
        <div className="divide-y divide-border/40">
          {departments.map((d, i) => {
            const Icon = iconFor(d.icon)
            const head = users.find(u => u.id === d.headUserId) || users[0]
            const members = users.filter(u => u.departmentId === d.id)
            const utilization = Math.round((d.storageUsedBytes / d.storageQuotaBytes) * 100)
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-accent/30"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${d.color}20`, color: d.color }}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{d.name}</p>
                      <span className="text-[10px] text-muted-foreground">/Company/{d.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{d.memberCount} members · Head: {head.name}</p>
                  </div>
                  <div className="hidden items-center gap-6 md:flex">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Storage</p>
                      <p className="text-xs font-medium">{fmtBytes(d.storageUsedBytes)} / {fmtBytes(d.storageQuotaBytes)}</p>
                    </div>
                    <div className="w-32">
                      <div className="mb-1 flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={utilization > 80 ? 'text-rose-500' : utilization > 60 ? 'text-amber-500' : 'text-emerald-500'}>{utilization}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn('h-full rounded-full', utilization > 80 ? 'bg-rose-500' : utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500')}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(d.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent"
                  >
                    {expanded.has(d.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <button onClick={() => toast(`Editing ${d.name}`)} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                    <Pencil size={14} />
                  </button>
                  <button className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                {expanded.has(d.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-border/40 bg-muted/20 px-4 py-3"
                  >
                    <h4 className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">Members ({members.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {members.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No members assigned</p>
                      ) : members.map(u => (
                        <div key={u.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 px-2 py-1">
                          <div className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{u.name}</p>
                            <p className="text-[9px] text-muted-foreground">{u.jobTitle} · {u.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
