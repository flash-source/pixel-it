'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRef, useState } from 'react'

export function Navbar() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  const initial = session?.user?.name?.[0]?.toUpperCase()
    ?? session?.user?.email?.[0]?.toUpperCase() ?? '?'
  const firstName = session?.user?.name?.split(' ')[0]
    ?? session?.user?.email?.split('@')[0] ?? ''

  return (
    <nav className="sticky top-0 z-50 bg-[#07070d]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 h-14 flex items-center justify-between">
        <Link href="/">
          <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[11px] text-[#6c63ff]">
            pixel<span className="text-white">.it</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="w-24 h-7 rounded-lg bg-white/5 animate-pulse" />
          )}

          {status === 'unauthenticated' && (
            <>
              <Link href="/login"
                className="text-[11px] text-white/35 hover:text-white/70 px-4 py-2 transition-colors"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                sign in
              </Link>
              <Link href="/register"
                className="text-[11px] font-semibold text-white bg-[#6c63ff] hover:bg-[#7b73ff] px-5 py-2 rounded-lg transition-colors shadow-[0_0_24px_rgba(108,99,255,0.35)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                get started
              </Link>
            </>
          )}

          {status === 'authenticated' && (
            <>
              <Link href="/create"
                className="text-[11px] font-semibold text-white bg-[#6c63ff] hover:bg-[#7b73ff] px-5 py-2 rounded-lg transition-colors shadow-[0_0_24px_rgba(108,99,255,0.35)]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                open editor
              </Link>

              <div className="relative" onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <div className="w-7 h-7 rounded-md bg-[#6c63ff] flex items-center justify-center text-[11px] font-bold text-white">
                    {initial}
                  </div>
                  <span className="text-[11px] text-white/50 hidden sm:block">{firstName}</span>
                  <span className="text-white/25 text-[10px]">▾</span>
                </button>

                {open && (
                  <div
                    className="absolute right-0 top-full mt-1 w-52 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)' }}
                    onMouseEnter={openMenu}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        className="text-[10px] text-white/30 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="p-1.5 flex flex-col gap-0.5">
                      <MenuItem href="/dashboard" label="dashboard" />
                      <MenuItem href="/projects" label="my projects" />
                      <div className="h-px bg-white/[0.06] my-1" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full text-left px-3 py-2 rounded-lg text-[11px] text-red-400/80 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function MenuItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="px-3 py-2 rounded-lg text-[11px] text-white/50 hover:text-white/90 hover:bg-white/[0.05] transition-colors block"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {label}
    </Link>
  )
}