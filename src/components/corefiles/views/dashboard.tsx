'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell, RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'
import {
  HardDrive, Users, Upload, Download, Activity, Cpu, MemoryStick, Server,
  Database, Container, Boxes, ShieldCheck, AlertTriangle, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, TrendingUp, Zap, Network,
} from 'lucide-react'
import {
  departments, users, activityLogs, serverServices, networkInSeries,
  uploadDownloadTrend, storageByDept, fmtBytes, totalStorageUsed,
  totalStorageQuota, todayUploads, todayDownloads, activeUsersToday,
  userById, type ActivityLog,
} from '@/components/corefiles/data/mock'
import { Avatar } from '@/components/corefiles/common/avatar'
import { useApp } from '@/lib/corefiles/store'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

// ---------------- Helpers ----------------

const actionColor: Record<ActivityLog['action'], string> = {
  viewed: 'text-sky-500 bg-sky-500/10',
  downloaded: 'text-violet-500 bg-violet-500/10',
  uploaded: 'text-emerald-500 bg-emerald-500/10',
  deleted: 'text-rose-500 bg-rose-500/10',
  renamed: 'text-amber-500 bg-amber-500/10',
  shared: 'text-cyan-500 bg-cyan-500/10',
  moved: 'text-indigo-500 bg-indigo-500/10',
  restored: 'text-emerald-500 bg-emerald-500/10',
  permission_changed: 'text-fuchsia-500 bg-fuchsia-500/10',
  locked: 'text-orange-500 bg-orange-500/10',
  unlocked: 'text-emerald-500 bg-emerald-500/10',
  favorited: 'text-yellow-500 bg-yellow-500/10',
  commented: 'text-blue-500 bg-blue-500/10',
  version_created: 'text-purple-500 bg-purple-500/10',
}

function StatCard({
  label, value, delta, trend, icon: Icon, accent, series,
}: {
  label: string
  value: string
  delta: number
  trend: 'up' | 'down' | 'flat'
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent: 'green' | 'blue' | 'amber' | 'rose' | 'violet'
  series: number[]
}) {
  const accentMap = {
    green: 'from-emerald-500 to-teal-600 text-emerald-600 dark:text-emerald-400',
    blue: 'from-sky-500 to-blue-600 text-sky-600 dark:text-sky-400',
    amber: 'from-amber-500 to-orange-600 text-amber-600 dark:text-amber-400',
    rose: 'from-rose-500 to-pink-600 text-rose-600 dark:text-rose-400',
    violet: 'from-violet-500 to-purple-600 text-violet-600 dark:text-violet-400',
  }
  const stroke = {
    green: '#10b981', blue: '#0ea5e9', amber: '#f59e0b', rose: '#f43f5e', violet: '#8b5cf6',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass cf-lift shadow-float group relative overflow-hidden rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm', accentMap[accent].split(' ')[0], accentMap[accent].split(' ')[1])}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className={cn('flex items-center gap-1 text-xs font-medium', accentMap[accent].split(' ')[2])}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
          {delta > 0 ? '+' : ''}{delta}% <span className="text-muted-foreground">vs yesterday</span>
        </div>
        <div className="h-8 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series.map((v, i) => ({ i, v }))} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
              <defs>
                <linearGradient id={`g-${accent}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke[accent]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={stroke[accent]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={stroke[accent]} strokeWidth={1.8} fill={`url(#g-${accent})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}

function ServicePill({ name, status, uptime, version }: { name: string; status: 'online' | 'degraded' | 'offline'; uptime: string; version: string }) {
  const colorMap = {
    online: 'text-emerald-500',
    degraded: 'text-amber-500',
    offline: 'text-rose-500',
  }
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={cn('relative flex h-2 w-2', colorMap[status])}>
          <span className={cn('pulse-dot inline-flex h-2 w-2 rounded-full bg-current')} />
        </span>
        <span className="text-xs font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>v{version}</span>
        <span>·</span>
        <span>{uptime}</span>
      </div>
    </div>
  )
}

function RadialMetric({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: label, value }]} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={20} fill={color} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center">
            <Icon size={14} className="text-muted-foreground" />
            <span className="mt-0.5 text-lg font-bold">{value}%</span>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// ---------------- Main ----------------

export function DashboardView() {
  const { user } = useApp()
  const storageUsed = totalStorageUsed()
  const storageQuota = totalStorageQuota()
  const storagePct = Math.round((storageUsed / storageQuota) * 100)

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass cf-lift shadow-float relative overflow-hidden rounded-2xl p-6"
      >
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, <span className="brand-text">{user?.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              System is healthy · all 10 services online · 1 alert needs your attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:text-emerald-400">
              <p className="text-[10px] font-medium uppercase">Storage</p>
              <p className="text-sm font-bold">{fmtBytes(storageUsed)} / {fmtBytes(storageQuota)}</p>
            </div>
            <div className="rounded-xl bg-sky-500/10 px-3 py-2 text-sky-600 dark:text-sky-400">
              <p className="text-[10px] font-medium uppercase">Active now</p>
              <p className="text-sm font-bold">{activeUsersToday()} users</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Storage Used" value={fmtBytes(storageUsed)} delta={2.4} trend="up" icon={HardDrive} accent="green"
          series={[42, 44, 43, 46, 48, 47, 49, 52, 55, 58, 61, 64]} />
        <StatCard label="Active Users (24h)" value={String(activeUsersToday())} delta={8.1} trend="up" icon={Users} accent="blue"
          series={[8, 10, 9, 11, 12, 10, 11, 9, 12, 14, 13, 12]} />
        <StatCard label="Today's Uploads" value={String(todayUploads())} delta={12.5} trend="up" icon={Upload} accent="violet"
          series={[20, 24, 18, 28, 32, 30, 35, 40, 38, 44, 42, 47]} />
        <StatCard label="Today's Downloads" value={String(todayDownloads())} delta={-4.2} trend="down" icon={Download} accent="amber"
          series={[110, 115, 120, 118, 125, 130, 128, 135, 132, 140, 138, 128]} />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Network usage */}
        <div className="glass cf-lift shadow-float lg:col-span-2 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Network size={15} className="text-primary" /> Network Usage (24h)
              </h3>
              <p className="text-xs text-muted-foreground">Inbound vs outbound traffic in MB/s</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Inbound</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Outbound</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={networkInSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g-in" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g-out" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#10b981" strokeWidth={2} fill="url(#g-in)" />
                <Area type="monotone" dataKey="outbound" stroke="#0ea5e9" strokeWidth={2} fill="url(#g-out)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System resources */}
        <div className="glass cf-lift shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Cpu size={15} className="text-primary" /> System Resources
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <RadialMetric label="CPU" value={18} color="#10b981" icon={Cpu} />
            <RadialMetric label="RAM" value={42} color="#0ea5e9" icon={MemoryStick} />
            <RadialMetric label="Disk" value={67} color="#f59e0b" icon={HardDrive} />
          </div>
          <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Load average</span>
              <span className="font-medium">0.42 · 0.58 · 0.61</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-medium">42d 18h 24m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kernel</span>
              <span className="font-medium">Linux 6.8.0-45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">CPU temp</span>
              <span className="font-medium text-emerald-500">52°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upload/Download trend */}
        <div className="glass cf-lift shadow-float lg:col-span-2 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp size={15} className="text-primary" /> Uploads vs Downloads (14 days)
              </h3>
              <p className="text-xs text-muted-foreground">Daily file activity across all departments</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={uploadDownloadTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', color: 'var(--foreground)' }}
                />
                <Bar dataKey="uploads" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Uploads" />
                <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]} name="Downloads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage by department */}
        <div className="glass cf-lift shadow-float rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <HardDrive size={15} className="text-primary" /> Storage by Department
          </h3>
          <div className="cf-scroll max-h-56 space-y-2 overflow-y-auto pr-1">
            {storageByDept.map(d => {
              const pct = Math.round((d.used / d.quota) * 100)
              return (
                <div key={d.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">{d.used}/{d.quota} GB</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Services & Activities */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Services */}
        <div className="glass cf-lift shadow-float lg:col-span-2 rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Container size={15} className="text-primary" /> Service Status
              </h3>
              <p className="text-xs text-muted-foreground">All Docker containers running on Ubuntu Server</p>
            </div>
            <button className="text-xs text-primary hover:underline">View monitoring →</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {serverServices.map(s => <ServicePill key={s.name} {...s} />)}
          </div>
        </div>

        {/* Recent activity */}
        <div className="glass cf-lift shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Activity size={15} className="text-primary" /> Latest Activity
          </h3>
          <div className="cf-scroll max-h-80 space-y-1 overflow-y-auto pr-1">
            {activityLogs.slice(0, 8).map(log => {
              const actor = userById(log.userId)
              return (
                <div key={log.id} className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/40">
                  <Avatar name={actor?.name || 'Unknown'} size={28} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs leading-snug">
                      <span className="font-semibold">{actor?.name || 'Unknown'}</span>{' '}
                      <span className={cn('rounded px-1 py-0.5 text-[10px] font-medium', actionColor[log.action])}>{log.action.replace(/_/g, ' ')}</span>{' '}
                      <span className="text-muted-foreground">{log.fileName}</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })} · {log.ip}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass cf-lift-sm flex items-center gap-3 rounded-2xl p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Security score</p>
            <p className="text-sm font-bold">94 / 100</p>
          </div>
        </div>
        <div className="glass cf-lift-sm flex items-center gap-3 rounded-2xl p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Pending approvals</p>
            <p className="text-sm font-bold">3 files</p>
          </div>
        </div>
        <div className="glass cf-lift-sm flex items-center gap-3 rounded-2xl p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><Database size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">DB connections</p>
            <p className="text-sm font-bold">28 / 100</p>
          </div>
        </div>
        <div className="glass cf-lift-sm flex items-center gap-3 rounded-2xl p-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10 text-violet-500"><Zap size={18} /></div>
          <div>
            <p className="text-xs text-muted-foreground">Redis ops/s</p>
            <p className="text-sm font-bold">1,847</p>
          </div>
        </div>
      </div>
    </div>
  )
}
