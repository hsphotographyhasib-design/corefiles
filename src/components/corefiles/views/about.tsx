'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Boxes, Code, Building2, User, Calendar, GitBranch, Hash, Clock,
  FileText, Shield, Server, Database, Container, Globe, Cpu, HardDrive,
  CheckCircle2, Copy,
} from 'lucide-react'
import { BUILD_INFO } from '@/lib/corefiles/build-info'
import { useApp } from '@/lib/corefiles/store'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

/**
 * AboutView — displays application metadata, build info, and ownership.
 *
 * Spec:
 *   - Application Name
 *   - Version
 *   - Build Number
 *   - Developer ID (amdsaib96)
 *   - Company (Hasanur Jaya Sdn. Bhd.)
 *   - Copyright
 *   - License
 *   - Build Date
 *   - Git Commit Hash
 */
export function AboutView() {
  const { setBreadcrumbs } = useApp()
  React.useEffect(() => { setBreadcrumbs([{ label: 'About CoreFiles', view: 'about' }]) }, [setBreadcrumbs])

  const sections: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; rows: { label: string; value: string; copyable?: boolean }[] }[] = [
    {
      title: 'Application',
      icon: Boxes,
      rows: [
        { label: 'Name', value: BUILD_INFO.appName },
        { label: 'Version', value: BUILD_INFO.version },
        { label: 'Build ID', value: BUILD_INFO.buildId, copyable: true },
        { label: 'Build Date', value: format(new Date(BUILD_INFO.buildTime), 'PPpp') },
        { label: 'Homepage', value: BUILD_INFO.homepage },
      ],
    },
    {
      title: 'Source Control',
      icon: GitBranch,
      rows: [
        { label: 'Git Commit', value: BUILD_INFO.gitCommit, copyable: true },
        { label: 'Git Branch', value: BUILD_INFO.gitBranch },
        { label: 'Repository', value: BUILD_INFO.repository },
      ],
    },
    {
      title: 'Ownership',
      icon: User,
      rows: [
        { label: 'Developer', value: BUILD_INFO.developer, copyable: true },
        { label: 'Company', value: BUILD_INFO.company },
        { label: 'Copyright', value: BUILD_INFO.copyright },
        { label: 'License', value: BUILD_INFO.license },
      ],
    },
  ]

  const copyValue = (value: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value)
      toast(`Copied: ${value}`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass cf-lift shadow-float rounded-3xl p-8 text-center"
      >
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-glow">
          <Boxes size={36} strokeWidth={2.4} />
        </div>
        <h1 className="text-3xl font-bold brand-text">{BUILD_INFO.appName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enterprise Document Management System</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">v{BUILD_INFO.version}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{BUILD_INFO.buildId}</span>
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600">Developer: {BUILD_INFO.developer}</span>
        </div>
      </motion.div>

      {/* Info sections */}
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass cf-lift shadow-float rounded-2xl p-5"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <section.icon size={15} className="text-primary" /> {section.title}
            </h3>
            <div className="space-y-2">
              {section.rows.map(row => (
                <div key={row.label} className="group">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium">{row.value}</p>
                    {row.copyable && (
                      <button
                        onClick={() => copyValue(row.value)}
                        className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                        aria-label={`Copy ${row.label}`}
                      >
                        <Copy size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Copyright + License */}
      <div className="glass cf-lift-sm shadow-float rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold">{BUILD_INFO.copyright}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          CoreFiles Enterprise Document Management System · {BUILD_INFO.license}
        </p>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Developed by <span className="font-mono font-semibold text-primary">{BUILD_INFO.developer}</span> · All Rights Reserved
        </p>
      </div>
    </div>
  )
}
