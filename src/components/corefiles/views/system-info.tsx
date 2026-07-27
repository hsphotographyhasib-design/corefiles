'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Server, Database, Container, Cpu, HardDrive, Globe, Clock, User,
  Shield, Activity, Boxes, Network, Thermometer, Zap,
} from 'lucide-react'
import { BUILD_INFO } from '@/lib/corefiles/build-info'
import { useApp } from '@/lib/corefiles/store'
import { serverServices } from '@/components/corefiles/data/mock'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

/**
 * SystemInfoView — displays runtime environment info.
 *
 * Spec:
 *   - Application Version
 *   - Database Version
 *   - Docker Version
 *   - Server Version
 *   - Developer (amdsaib96)
 */
export function SystemInfoView() {
  const { setBreadcrumbs } = useApp()
  React.useEffect(() => { setBreadcrumbs([{ label: 'System Information', view: 'system-info' }]) }, [setBreadcrumbs])

  const cards: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; rows: { label: string; value: string }[]; accent: string }[] = [
    {
      title: 'Application',
      icon: Boxes,
      accent: 'text-emerald-500 bg-emerald-500/10',
      rows: [
        { label: 'Name', value: BUILD_INFO.appName },
        { label: 'Version', value: BUILD_INFO.version },
        { label: 'Build', value: BUILD_INFO.buildId },
        { label: 'Developer', value: BUILD_INFO.developer },
      ],
    },
    {
      title: 'Database',
      icon: Database,
      accent: 'text-sky-500 bg-sky-500/10',
      rows: [
        { label: 'Engine', value: 'PostgreSQL' },
        { label: 'Version', value: '16.3' },
        { label: 'Connection pool', value: '28 / 100' },
        { label: 'Schema migrations', value: 'v2.4.1 (47 applied)' },
      ],
    },
    {
      title: 'Docker',
      icon: Container,
      accent: 'text-violet-500 bg-violet-500/10',
      rows: [
        { label: 'Docker version', value: '27.1.1' },
        { label: 'Compose version', value: 'v2.29.1' },
        { label: 'Running containers', value: '10 / 10' },
        { label: 'Network', value: 'corefiles-net (bridge)' },
      ],
    },
    {
      title: 'Server',
      icon: Server,
      accent: 'text-amber-500 bg-amber-500/10',
      rows: [
        { label: 'OS', value: 'Ubuntu 24.04 LTS' },
        { label: 'Kernel', value: '6.8.0-45-generic' },
        { label: 'Uptime', value: '42d 18h 24m' },
        { label: 'Hostname', value: 'corefiles-prod-01' },
      ],
    },
    {
      title: 'Hardware',
      icon: Cpu,
      accent: 'text-rose-500 bg-rose-500/10',
      rows: [
        { label: 'CPU', value: '8 vCPU · Intel Xeon E5' },
        { label: 'Memory', value: '32 GB DDR4 ECC' },
        { label: 'Disk', value: '2 TB SSD (NVMe)' },
        { label: 'CPU temp', value: '52°C' },
      ],
    },
    {
      title: 'Network',
      icon: Network,
      accent: 'text-cyan-500 bg-cyan-500/10',
      rows: [
        { label: 'Domain', value: 'corefiles.hasanurjaya.com' },
        { label: 'IP address', value: '203.106.84.12' },
        { label: 'CDN', value: 'Cloudflare' },
        { label: 'TLS', value: 'Let\'s Encrypt (TLS 1.3)' },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass cf-lift shadow-float rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold">
              <Server size={20} className="text-primary" /> System Information
            </h1>
            <p className="text-xs text-muted-foreground">
              Runtime environment · Build {BUILD_INFO.buildId} · Developer {BUILD_INFO.developer}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Info cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass cf-lift-sm shadow-float rounded-2xl p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className={cn('grid h-9 w-9 place-items-center rounded-xl', card.accent)}>
                <card.icon size={17} />
              </span>
              <h3 className="text-sm font-semibold">{card.title}</h3>
            </div>
            <div className="space-y-2">
              {card.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">{row.label}</span>
                  <span className="truncate text-xs font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Service status */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Activity size={15} className="text-primary" /> Service Status
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {serverServices.map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span className="truncate text-xs font-medium">{s.name}</span>
              <span className={cn(
                'flex items-center gap-1 text-[10px] font-medium',
                s.status === 'online' ? 'text-emerald-500' :
                s.status === 'degraded' ? 'text-amber-500' :
                'text-rose-500'
              )}>
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-current" />
                {s.status} · v{s.version}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer attribution */}
      <div className="glass rounded-2xl p-4 text-center text-[10px] text-muted-foreground">
        <p>{BUILD_INFO.appName} Enterprise v{BUILD_INFO.version} · {BUILD_INFO.copyright}</p>
        <p className="mt-1">Developed by <span className="font-mono font-semibold text-primary">{BUILD_INFO.developer}</span> · All Rights Reserved</p>
      </div>
    </div>
  )
}
