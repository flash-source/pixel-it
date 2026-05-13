'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const pixels = [
  ['#00d4aa','#007a5e','#00d4aa','#00a882','#00d4aa'],
  ['#007a5e','#00d4aa','#00a882','#00d4aa','#007a5e'],
  ['#00a882','#00d4aa','#007a5e','#00d4aa','#00a882'],
  ['#00d4aa','#00a882','#00d4aa','#007a5e','#00d4aa'],
  ['#007a5e','#00d4aa','#00a882','#00d4aa','#007a5e'],
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }

    await signIn('credentials', { email, password, callbackUrl: '/' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#07070d] flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col w-[45%] bg-[#0a0a14] border-r border-white/[0.06] p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,212,170,0.12),transparent_55%)] pointer-events-none" />

        <Link href="/" className="relative z-10">
          <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[12px] text-[#6c63ff]">
            pixel<span className="text-white">.it</span>
          </span>
        </Link>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="grid gap-0.5 w-[110px] mb-10" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {pixels.flat().map((c, i) => (
              <div key={i} className="aspect-square rounded-[2px]" style={{ background: c, opacity: 0.6 + (i % 5) * 0.08 }} />
            ))}
          </div>

          <h2 style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[36px] font-black text-[#f0f0fa] leading-tight mb-4">
            start creating<br />today.
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[12px] text-white/30 leading-loose max-w-xs">
            free forever. no credit card. just open the canvas and make something.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {['Manual pixel editor with full tools', 'Image → pixel art conversion', 'Game-character avatar builder'].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-none bg-[#00d4aa]" />
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-white/30">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="relative z-10 text-[10px] text-white/15">
          pixel.it — pixel art for everyone
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">

        <Link href="/" className="lg:hidden mb-10">
          <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[12px] text-[#6c63ff]">
            pixel<span className="text-white">.it</span>
          </span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 style={{ fontFamily: "'Syne', sans-serif" }}
              className="text-[32px] font-black text-[#f0f0fa] mb-2">
              create account
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[12px] text-white/30">
              already have one?{' '}
              <Link href="/login" className="text-[#6c63ff] hover:text-[#9b8cff] transition-colors">sign in</Link>
            </p>
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl mb-7 text-[12px] text-white/50 hover:text-white/80 transition-all"
            style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <GoogleIcon />
            continue with google
          </button>

          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-white/20">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="name" type="text" value={name} onChange={setName} placeholder="your name" />
            <Field label="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="password" type="password" value={password} onChange={setPassword} placeholder="min. 6 characters" />

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/8 border border-red-500/20">
                <span className="text-red-400 text-[10px]">✕</span>
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-red-400/80">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-[12px] font-semibold text-white bg-[#6c63ff] hover:bg-[#7b73ff] disabled:opacity-40 transition-all mt-1 shadow-[0_0_32px_rgba(108,99,255,0.3)]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {loading ? 'creating account...' : 'create account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-white/40 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type} value={value} required placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl text-[13px] text-white/80 placeholder-white/15 outline-none transition-all"
        style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        onFocus={(e) => { e.target.style.borderColor = 'rgba(108,99,255,0.5)'; e.target.style.background = 'rgba(108,99,255,0.05)' }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}