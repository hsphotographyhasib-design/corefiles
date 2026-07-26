'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Boxes, Shield, Lock, Mail, Eye, EyeOff, Fingerprint, Loader2, ArrowRight, CheckCircle2, Server, Cloud } from 'lucide-react'
import { useApp } from '@/lib/corefiles/store'

export function LoginScreen() {
  const { login } = useApp()
  const [email, setEmail] = React.useState('hasan@hasanurjaya.com')
  const [password, setPassword] = React.useState('CoreFiles2026!')
  const [showPw, setShowPw] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
  const [twoFA, setTwoFA] = React.useState(false)
  const [step, setStep] = React.useState<'creds' | '2fa'>('creds')
  const [loading, setLoading] = React.useState(false)
  const [otp, setOtp] = React.useState(['', '', '', '', '', ''])

  const submitCreds = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('2fa')
    }, 1100)
  }

  const submit2FA = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); login() }, 900)
  }

  const setOtpAt = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-8 px-4 py-8 lg:flex-row lg:gap-16">
        {/* Left side — brand & value props */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-glow">
              <Boxes size={26} strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-2xl font-bold brand-text">CoreFiles</h1>
              <p className="text-xs text-muted-foreground">Hasanur Jaya Sdn. Bhd.</p>
            </div>
          </div>

          <h2 className="mb-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Your enterprise documents,
            <br />
            <span className="brand-text">secured on your own server.</span>
          </h2>
          <p className="mb-8 max-w-md text-sm text-muted-foreground">
            Self-hosted Enterprise Document Management System (EDMS) & private cloud storage.
            Bank-grade encryption, RBAC, audit trails, and approval workflows — built for engineering teams.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'End-to-end security', desc: 'AES-256 + JWT + 2FA' },
              { icon: Server, title: 'Self-hosted', desc: 'Ubuntu + Docker + MinIO' },
              { icon: Cloud, title: 'Cloud-ready', desc: 'Scales to millions of files' },
            ].map(card => (
              <div key={card.title} className="glass cf-lift-sm rounded-xl p-4">
                <card.icon size={20} className="mb-2 text-primary" />
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              {['H', 'A', 'D', 'S', 'L'].map((l, i) => (
                <div key={i} className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white ring-2 ring-background">
                  {l}
                </div>
              ))}
            </div>
            <span>Trusted by 1,200+ engineers across 12 departments</span>
          </div>
        </motion.div>

        {/* Right side — auth card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="glass-strong shadow-float rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold">
                {step === 'creds' ? 'Sign in to CoreFiles' : 'Two-factor verification'}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {step === 'creds'
                  ? 'Enter your credentials to access your workspace.'
                  : 'Enter the 6-digit code from your authenticator app.'}
              </p>
            </div>

            {step === 'creds' ? (
              <form onSubmit={submitCreds} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Work email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="you@hasanurjaya.com"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-xs font-medium">Password</label>
                    <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="h-11 w-full rounded-xl border border-border bg-background/60 pl-9 pr-9 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-primary" />
                    Remember me for 30 days
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={twoFA} onChange={e => setTwoFA(e.target.checked)} className="h-3.5 w-3.5 rounded border-border accent-primary" />
                    Require 2FA
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-glow active:scale-[0.99] disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Authenticating…</>
                  ) : (
                    <>Continue <ArrowRight size={16} /></>
                  )}
                </button>

                <div className="rounded-xl bg-muted/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
                  🔒 All logins are recorded in the audit log with IP, device, and location.
                </div>
              </form>
            ) : (
              <form onSubmit={submit2FA} className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                    <Fingerprint size={26} />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Code sent to <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={d}
                      onChange={e => setOtpAt(i, e.target.value)}
                      maxLength={1}
                      inputMode="numeric"
                      className="h-12 w-12 rounded-xl border border-border bg-background/60 text-center text-lg font-bold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.some(d => !d)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-glow active:scale-[0.99] disabled:opacity-60"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : <><CheckCircle2 size={16} /> Verify & sign in</>}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('creds')}
                  className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
                >
                  ← Back to credentials
                </button>
              </form>
            )}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Protected by reCAPTCHA · © 2026 Hasanur Jaya Sdn. Bhd. · <span className="text-primary">corefiles.hasanurjaya.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
