'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, LineChart, Line, Legend,
} from 'recharts'
import {
  BarChart3, Download, FileText, Calendar, FileSpreadsheet, Image as Img,
  Film, File as FileIcon, Ruler, TrendingUp, Users, HardDrive,
} from 'lucide-react'
import { files, users, departments, fileTypeMeta } from '@/components/corefiles/data/mock'
import { toast } from '@/components/corefiles/common/toast-bridge'

export function ReportsView() {
  // File type distribution
  const typeDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {}
    files.forEach(f => { counts[f.type] = (counts[f.type] || 0) + 1 })
    return Object.entries(counts).map(([type, count]) => ({
      name: fileTypeMeta[type as keyof typeof fileTypeMeta]?.label || type,
      value: count,
      color: fileTypeMeta[type as keyof typeof fileTypeMeta]?.color || '#999',
    }))
  }, [])

  // Files per department
  const filesPerDept = departments.slice(0, 8).map(d => ({
    name: d.name.slice(0, 8),
    files: Math.round(d.fileCount * 0.6 + Math.random() * 20),
    storage: +(d.storageUsedBytes / (1024 ** 3)).toFixed(0),
  }))

  // User activity trend (mock 30 days)
  const activityTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    uploads: Math.round(15 + 20 * Math.sin(i / 4) + Math.random() * 15),
    downloads: Math.round(35 + 25 * Math.cos(i / 5) + Math.random() * 20),
    views: Math.round(120 + 40 * Math.sin(i / 3) + Math.random() * 30),
  }))

  // Storage growth
  const storageGrowth = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i],
    used: Math.round(800 + i * 35 + Math.random() * 20),
    quota: 2048,
  }))

  return (
    <div className="space-y-4">
      <div className="glass shadow-float flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BarChart3 size={18} className="text-primary" /> Reports & Analytics
          </h2>
          <p className="text-xs text-muted-foreground">Insights across file usage, users, departments, and storage.</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>This quarter</option>
            <option>This year</option>
          </select>
          <button onClick={() => toast('PDF report exported')} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent">
            <Download size={13} /> Export PDF
          </button>
          <button onClick={() => toast('Excel export started')} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:shadow-glow">
            <FileSpreadsheet size={13} /> Export Excel
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total files', value: '2,847', delta: '+128', icon: FileText, color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Total users', value: users.length, delta: '+3', icon: Users, color: 'text-sky-500 bg-sky-500/10' },
          { label: 'Avg file size', value: '4.8 MB', delta: '-0.2 MB', icon: HardDrive, color: 'text-violet-500 bg-violet-500/10' },
          { label: 'Storage growth', value: '+12%', delta: 'this month', icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass cf-lift-sm shadow-float rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.delta}</p>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.color}`}><s.icon size={18} /></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity trend */}
        <div className="glass shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp size={15} className="text-primary" /> Activity Trend (30 days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={4} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="uploads" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* File type distribution */}
        <div className="glass shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <FileText size={15} className="text-primary" /> File Type Distribution
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-48 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeDistribution} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                    {typeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {typeDistribution.map(t => (
                <div key={t.name} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  <span className="flex-1">{t.name}</span>
                  <span className="font-medium">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Files per dept */}
        <div className="glass shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Users size={15} className="text-primary" /> Files & Storage by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filesPerDept} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="files" fill="#10b981" radius={[4, 4, 0, 0]} name="Files" />
                <Bar dataKey="storage" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Storage (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage growth */}
        <div className="glass shadow-float rounded-2xl p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <HardDrive size={15} className="text-primary" /> Storage Growth (12 months)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageGrowth} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="g-storage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} unit=" GB" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="used" fill="url(#g-storage)" radius={[4, 4, 0, 0]} name="Used (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top files table */}
      <div className="glass shadow-float rounded-2xl p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Calendar size={15} className="text-primary" /> Top accessed files (this week)
        </h3>
        <div className="space-y-2">
          {files.slice(0, 6).map((f, i) => (
            <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="text-[10px] text-muted-foreground">{f.path.join(' / ')}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium">{Math.round(20 + Math.random() * 80)} views</p>
                <p className="text-[10px] text-muted-foreground">{Math.round(5 + Math.random() * 25)} downloads</p>
              </div>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(40 + Math.random() * 50)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
