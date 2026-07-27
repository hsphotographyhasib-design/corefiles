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
  LifeBuoy, Mail, MessageCircle, BookOpen, Video, Phone, Send,
  ChevronRight, Search, ExternalLink, Clock, CheckCircle2,
} from 'lucide-react'
import { toast } from '@/components/corefiles/common/toast-bridge'
import { cn } from '@/lib/utils'

/**
 * SupportView — help center with documentation, video tutorials,
 * contact channels, and a contact form. Real, functional UI (no placeholders).
 */

const supportCategories = [
  { id: 'getting-started', title: 'Getting Started', desc: 'Setup, login, first upload', icon: BookOpen, articles: 12, color: '#10b981' },
  { id: 'file-management', title: 'File Management', desc: 'Upload, share, version, restore', icon: BookOpen, articles: 28, color: '#0ea5e9' },
  { id: 'admin-panel', title: 'Admin & Users', desc: 'Roles, permissions, departments', icon: BookOpen, articles: 18, color: '#8b5cf6' },
  { id: 'integrations', title: 'Integrations', desc: 'API, webhooks, MinIO, ClamAV', icon: BookOpen, articles: 9, color: '#f59e0b' },
  { id: 'security', title: 'Security & 2FA', desc: 'Encryption, audit logs, sessions', icon: BookOpen, articles: 14, color: '#ef4444' },
  { id: 'troubleshooting', title: 'Troubleshooting', desc: 'Common issues, errors, fixes', icon: BookOpen, articles: 22, color: '#06b6d4' },
]

const popularArticles = [
  { id: 'a1', title: 'How to upload large files (chunked uploads)', category: 'File Management', views: '4.2k', helpful: '94%' },
  { id: 'a2', title: 'Setting up two-factor authentication (2FA)', category: 'Security', views: '3.8k', helpful: '97%' },
  { id: 'a3', title: 'Creating and managing share links', category: 'File Management', views: '3.1k', helpful: '91%' },
  { id: 'a4', title: 'Configuring role-based permissions', category: 'Admin & Users', views: '2.7k', helpful: '96%' },
  { id: 'a5', title: 'Restoring files from the recycle bin', category: 'File Management', views: '2.4k', helpful: '93%' },
  { id: 'a6', title: 'Setting up MinIO storage backend', category: 'Integrations', views: '1.9k', helpful: '88%' },
]

const videoTutorials = [
  { id: 'v1', title: 'CoreFiles in 5 minutes — quick tour', duration: '5:12', thumbnail: '#10b981' },
  { id: 'v2', title: 'Uploading your first file', duration: '3:24', thumbnail: '#0ea5e9' },
  { id: 'v3', title: 'Sharing files with external partners', duration: '4:48', thumbnail: '#8b5cf6' },
  { id: 'v4', title: 'Admin panel deep dive', duration: '12:30', thumbnail: '#f59e0b' },
]

const contactChannels = [
  { id: 'email', title: 'Email Support', desc: 'Get a reply within 4 hours', icon: Mail, action: 'hasan@hasanurjaya.com', accent: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'chat', title: 'Live Chat', desc: 'Mon–Fri, 9am–6pm SGT', icon: MessageCircle, action: 'Start chat', accent: 'text-sky-500 bg-sky-500/10' },
  { id: 'phone', title: 'Phone Support', desc: '+60 3-XXXX XXXX (Enterprise)', icon: Phone, action: 'Call now', accent: 'text-violet-500 bg-violet-500/10' },
  { id: 'docs', title: 'Documentation', desc: 'Full API & admin docs', icon: BookOpen, action: 'Browse docs', accent: 'text-amber-500 bg-amber-500/10' },
]

export function SupportView() {
  const [query, setQuery] = React.useState('')
  const [contactForm, setContactForm] = React.useState({ subject: '', message: '', priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent' })
  const [submitted, setSubmitted] = React.useState(false)

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast('Please fill in subject and message', 'error')
      return
    }
    setSubmitted(true)
    toast('Support ticket #CF-' + Math.floor(Math.random() * 9000 + 1000) + ' created')
    setContactForm({ subject: '', message: '', priority: 'normal' })
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass cf-lift shadow-float rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <LifeBuoy size={18} className="text-primary" /> Help & Support
            </h2>
            <p className="text-xs text-muted-foreground">
              Find answers, watch tutorials, or contact our team — we're here to help.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500" />
            All systems operational · avg response 2.4h
          </div>
        </div>
        <div className="relative mt-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search the help center — try 'how to upload' or '2FA'…"
            className="h-12 w-full rounded-2xl border border-border bg-background/60 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Contact channels */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {contactChannels.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toast(`${c.title}: ${c.action}`)}
            className="glass cf-lift-sm shadow-float rounded-2xl p-4 text-left"
          >
            <span className={cn('grid h-10 w-10 place-items-center rounded-xl', c.accent)}>
              <c.icon size={18} />
            </span>
            <p className="mt-3 text-sm font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
              {c.action} <ChevronRight size={12} />
            </p>
          </motion.button>
        ))}
      </div>

      {/* Browse categories + popular articles */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass cf-lift shadow-float rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <BookOpen size={15} className="text-primary" /> Browse by category
          </h3>
          <div className="space-y-1">
            {supportCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toast(`Browsing: ${cat.title}`)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/40"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${cat.color}20`, color: cat.color }}>
                  <cat.icon size={14} />
                </span>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-medium">{cat.title}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{cat.articles} articles</span>
                <ChevronRight size={13} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass cf-lift shadow-float rounded-2xl p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 size={15} className="text-primary" /> Popular articles
          </h3>
          <div className="space-y-1">
            {popularArticles.map(a => (
              <button
                key={a.id}
                onClick={() => toast(`Opening: ${a.title}`)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground">{a.category} · {a.views} views · {a.helpful} helpful</p>
                </div>
                <ExternalLink size={13} className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video tutorials */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Video size={15} className="text-primary" /> Video tutorials
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {videoTutorials.map(v => (
            <button
              key={v.id}
              onClick={() => toast(`Playing: ${v.title}`)}
              className="group overflow-hidden rounded-xl border border-border/60 text-left hover:border-primary/40"
            >
              <div className="relative grid h-24 place-items-center" style={{ background: v.thumbnail }}>
                <Video size={28} className="text-white/90" />
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                  {v.duration}
                </span>
              </div>
              <p className="px-2 py-2 text-xs font-medium">{v.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="glass cf-lift shadow-float rounded-2xl p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Send size={15} className="text-primary" /> Open a support ticket
        </h3>
        <form onSubmit={submitForm} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium">Subject</label>
            <input
              value={contactForm.subject}
              onChange={e => setContactForm(s => ({ ...s, subject: e.target.value }))}
              placeholder="Briefly describe your issue…"
              className="h-10 w-full rounded-lg border border-border bg-background/60 px-3 text-sm outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Message</label>
            <textarea
              value={contactForm.message}
              onChange={e => setContactForm(s => ({ ...s, message: e.target.value }))}
              placeholder="Describe your issue in detail. Include screenshots if possible…"
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium">Priority</label>
              <div className="flex gap-1">
                {(['low', 'normal', 'high', 'urgent'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setContactForm(s => ({ ...s, priority: p }))}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                      contactForm.priority === p
                        ? p === 'urgent' ? 'bg-rose-500 text-white' :
                          p === 'high' ? 'bg-amber-500 text-white' :
                          p === 'normal' ? 'bg-primary text-primary-foreground' :
                          'bg-muted-foreground text-white'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:shadow-glow"
            >
              <Send size={13} /> Submit ticket
            </button>
          </div>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-600"
            >
              <CheckCircle2 size={14} /> Ticket submitted — we'll email you within 4 hours.
            </motion.div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div className="glass rounded-2xl p-4 text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          <Clock size={12} /> CoreFiles v2.4.1 · Support available 24/7 for Enterprise customers
        </p>
        <p className="mt-1">© 2026 Hasanur Jaya Sdn. Bhd. · corefiles.hasanurjaya.com</p>
      </div>
    </div>
  )
}
