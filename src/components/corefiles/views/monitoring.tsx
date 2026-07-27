/**
 * Copyright (c) 2026 Hasanur Jaya Sdn. Bhd.
 * CoreFiles Enterprise Document Management System
 * Developer: amdsaib96
 * All Rights Reserved.
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts'
import {
  Server, Cpu, MemoryStick, HardDrive, Database, Container, Activity,
  Network, Thermometer, Zap, Clock, AlertTriangle, CheckCircle2, RefreshCw,
} from 'lucide-react'
import { serverServices, networkInSeries } from '@/components/corefiles/data/mock'
import { cn } from '@/lib/utils'

function RadialGauge({ label, value, max, color, unit, icon: Icon }: {
  label: string
  value: number
  max: number
  color: string
  unit?: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="glass cf-lift-sm shadow-float rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon size={13} /> {label}
        </h4>
        <span className={cn('text-[10px] font-medium', pct > 80 ? 'text-rose-500' : pct > 60 ? 'text-amber-500' : 'text-emerald-500')}>{pct}%</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-24 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ name: label, value: pct }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: 'var(--muted)' }} dataKey="value" cornerRadius={20} fill={color} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-base font-bold">{value}{unit || '%'}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Current</span><span className="font-medium">{value}{unit}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Peak (24h)</span><span className="font-medium">{Math.min(max, Math.round(value * 1.4))}{unit}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Avg (24h)</span><span className="font-medium">{Math.round(value * 0.75)}{unit}</span></div>
        </div>
      </div>
    </div>
  )
}

export function MonitoringView() {
  const [cpuHistory] = React.useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      t: i,
      cpu: Math.max(5, Math.round(20 + 15 * Math.sin(i / 6) + Math.random() * 10)),
      ram: Math.max(10, Math.round(40 + 8 * Math.cos(i / 8) + Math.random() * 5)),
      disk: 67,
      net: Math.round(40 + 30 * Math.sin(i / 4) + Math.random() * 20),
    }))
  )

  return (
    <div className="space-y-4">
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Server size={18} className="text-primary" /> Server Monitoring
          </h2>
          <p className="text-xs text-muted-foreground">Live metrics from your Ubuntu Server · Prometheus + Node Exporter + Grafana</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500" /> Live · 1s interval
          </span>
          <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* System metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <RadialGauge label="CPU Usage" value={18} max={100} color="#10b981" icon={Cpu} />
        <RadialGauge label="Memory" value={42} max={100} color="#0ea5e9" icon={MemoryStick} />
        <RadialGauge label="Disk" value={67} max={100} color="#f59e0b" icon={HardDrive} />
        <RadialGauge label="Network I/O" value={38} max={100} color="#8b5cf6" icon={Network} />
      </div>

      {/* Live chart */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Activity size={15} className="text-primary" /> Real-time System Metrics (60s)
            </h3>
            <p className="text-xs text-muted-foreground">CPU, memory, network throughput every second</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> CPU</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> RAM</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Network</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cpuHistory} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="m-cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="m-ram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="m-net" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} unit="s" interval={9} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cpu" stroke="#10b981" strokeWidth={2} fill="url(#m-cpu)" name="CPU %" />
              <Area type="monotone" dataKey="ram" stroke="#0ea5e9" strokeWidth={2} fill="url(#m-ram)" name="RAM %" />
              <Area type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={2} fill="url(#m-net)" name="Network %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network usage chart */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Network size={15} className="text-primary" /> Network Throughput (24h)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={networkInSeries} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="n-in" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="n-out" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} unit=" MB" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="inbound" stroke="#10b981" strokeWidth={2} fill="url(#n-in)" />
              <Area type="monotone" dataKey="outbound" stroke="#0ea5e9" strokeWidth={2} fill="url(#n-out)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Docker services */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Container size={15} className="text-primary" /> Docker Services
          </h3>
          <span className="text-xs text-muted-foreground">{serverServices.filter(s => s.status === 'online').length} of {serverServices.length} online</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {serverServices.map(s => {
            const color = s.status === 'online' ? 'text-emerald-500' : s.status === 'degraded' ? 'text-amber-500' : 'text-rose-500'
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border/60 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">{s.name}</p>
                  <span className={cn('relative flex h-2 w-2', color)}>
                    <span className={cn('pulse-dot inline-flex h-2 w-2 rounded-full bg-current')} />
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{s.description}</p>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                  <div><span className="text-muted-foreground">CPU</span><p className="font-medium">{s.cpu}%</p></div>
                  <div><span className="text-muted-foreground">RAM</span><p className="font-medium">{s.ram}%</p></div>
                  <div><span className="text-muted-foreground">Disk</span><p className="font-medium">{s.disk}%</p></div>
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>v{s.version}</span>
                  <span className="flex items-center gap-1"><Clock size={9} /> {s.uptime}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* System info */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'OS', value: 'Ubuntu 24.04 LTS', icon: Server, color: 'text-emerald-500' },
          { label: 'Kernel', value: '6.8.0-45-generic', icon: Cpu, color: 'text-sky-500' },
          { label: 'Uptime', value: '42d 18h 24m', icon: Clock, color: 'text-violet-500' },
          { label: 'CPU temp', value: '52°C', icon: Thermometer, color: 'text-amber-500' },
          { label: 'Load avg', value: '0.42 0.58 0.61', icon: Activity, color: 'text-emerald-500' },
          { label: 'Cores', value: '8 vCPU', icon: Zap, color: 'text-rose-500' },
          { label: 'Memory', value: '32 GB DDR4', icon: MemoryStick, color: 'text-sky-500' },
          { label: 'Disk', value: '2 TB SSD', icon: HardDrive, color: 'text-violet-500' },
        ].map(s => (
          <div key={s.label} className="glass shadow-float flex items-center gap-3 rounded-2xl p-4">
            <div className={cn('grid h-10 w-10 place-items-center rounded-xl bg-muted/40', s.color)}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
