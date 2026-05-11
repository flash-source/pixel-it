'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080f] text-white relative overflow-hidden">

      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(108,99,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '22px 22px',
        }}
      />

      <nav className="relative z-10 flex items-center justify-between px-10 py-[18px] border-b border-white/5">
        <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[12px] text-[#6c63ff]">
          pixel<span className="text-white">.it</span>
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[11px] text-white/30 hover:text-white/60 px-4 py-2 transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            sign in
          </Link>
          <Link
            href="/register"
            className="text-[11px] text-[#08080f] bg-[#6c63ff] px-5 py-2 rounded font-medium"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            get started
          </Link>
        </div>
      </nav>

      <section className="relative z-10 text-center pt-14 pb-10 px-10">
        <p
          className="text-[10px] text-[#6c63ff] tracking-[4px] uppercase mb-5 opacity-80"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          pixel art, your way
        </p>
        <h1
          className="text-[22px] text-[#f0f0f8] leading-[1.7] mb-5"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          make things<br />
          <span className="text-[#6c63ff]">pixel perfect.</span>
        </h1>
        <p
          className="text-[11px] text-white/30 max-w-[400px] mx-auto leading-loose"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          draw it. convert it. become it.<br />
          real pixel art tools that actually work.
        </p>
      </section>

      <section className="relative z-10 grid grid-cols-3 gap-3 px-10 pb-10 max-w-5xl mx-auto">
        {paths.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="group block rounded-lg p-6 relative overflow-hidden transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.028)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.028)'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: p.accent }} />

            <p
              className="text-[10px] mb-3 opacity-60"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: p.accent }}
            >
              {p.num}
            </p>

            <div
              className="w-9 h-9 rounded flex items-center justify-center mb-4 text-[17px]"
              style={{ background: p.accentDim, color: p.accent }}
            >
              {p.icon}
            </div>

            <h2 className="text-[15px] font-extrabold text-[#f0f0f8] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {p.title}
            </h2>

            <p
              className="text-[10px] text-white/28 leading-[1.9] mb-5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {p.desc}
            </p>

            <span
              className="text-[10px] flex items-center gap-1"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: p.accent }}
            >
              {p.cta} →
            </span>
          </Link>
        ))}
      </section>

      <footer className="relative z-10 px-10 py-4 border-t border-white/[0.04] flex justify-between items-center">
        <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[8px] text-white/15">
          pixel.it
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/15">
          made for people who love art
        </span>
      </footer>

    </main>
  )
}

const paths = [
  {
    id: 'manual',
    num: '01',
    title: 'Manual Editor',
    desc: 'draw pixel by pixel on a live canvas. full tool suite, undo history, export ready.',
    cta: 'open editor',
    href: '/create',
    accent: '#6c63ff',
    accentDim: 'rgba(108,99,255,0.12)',
    icon: '✏️',
  },
  {
    id: 'convert',
    num: '02',
    title: 'Image → Pixel',
    desc: 'upload any photo. get true pixel art — grid-aligned, palette-reduced, instantly editable.',
    cta: 'convert image',
    href: '/generate/from-image',
    accent: '#ff6b35',
    accentDim: 'rgba(255,107,53,0.12)',
    icon: '🖼',
  },
  {
    id: 'avatar',
    num: '03',
    title: 'Pixel Avatar',
    desc: 'upload your face. get a game-character version of you. add accessories, change the vibe.',
    cta: 'build avatar',
    href: '/avatar',
    accent: '#00d4aa',
    accentDim: 'rgba(0,212,170,0.12)',
    icon: '◈',
  },
]