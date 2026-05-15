'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef } from 'react'
import { Navbar } from '@/components/Navbar'

const CELL = 28
const COLOR = '#6c63ff'
const SEED_COUNT = 40

function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const litRef = useRef<Set<number>>(new Set())
  const colsRef = useRef(0)
  const rowsRef = useRef(0)
  const isDrawing = useRef(false)
  const seededRef = useRef(false)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(108,99,255,0.055)'
    ctx.lineWidth = 1
    for (let x = 0; x <= colsRef.current; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL + 0.5, 0); ctx.lineTo(x * CELL + 0.5, canvas.height); ctx.stroke()
    }
    for (let y = 0; y <= rowsRef.current; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL + 0.5); ctx.lineTo(canvas.width, y * CELL + 0.5); ctx.stroke()
    }
    litRef.current.forEach((idx) => {
      const cx = idx % colsRef.current
      const cy = Math.floor(idx / colsRef.current)
      const opacity = idx % 3 === 0 ? '28' : idx % 3 === 1 ? '32' : '22'
      ctx.fillStyle = COLOR + opacity
      ctx.fillRect(cx * CELL + 1, cy * CELL + 1, CELL - 1, CELL - 1)
    })
  }, [])

  const seed = useCallback(() => {
    if (seededRef.current) return
    const total = colsRef.current * rowsRef.current
    if (total === 0) return
    seededRef.current = true
    const ccS = Math.floor(colsRef.current * 0.3)
    const ccE = Math.floor(colsRef.current * 0.7)
    const crS = Math.floor(rowsRef.current * 0.15)
    const crE = Math.floor(rowsRef.current * 0.75)
    let attempts = 0
    while (litRef.current.size < SEED_COUNT && attempts < 500) {
      attempts++
      const cx = Math.floor(Math.random() * colsRef.current)
      const cy = Math.floor(Math.random() * rowsRef.current)
      if (cx >= ccS && cx <= ccE && cy >= crS && cy <= crE) continue
      litRef.current.add(cy * colsRef.current + cx)
    }
    draw()
  }, [draw])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    colsRef.current = Math.ceil(window.innerWidth / CELL)
    rowsRef.current = Math.ceil(window.innerHeight / CELL)
    draw()
    if (!seededRef.current) seed()
  }, [draw, seed])

  useEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [resize])

  const cellFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return -1
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const cx = Math.floor((clientX - rect.left) / CELL)
    const cy = Math.floor((clientY - rect.top) / CELL)
    if (cx < 0 || cy < 0 || cx >= colsRef.current || cy >= rowsRef.current) return -1
    return cy * colsRef.current + cx
  }

  const light = (e: React.MouseEvent | React.TouchEvent) => {
    const idx = cellFromEvent(e)
    if (idx < 0) return
    litRef.current.has(idx) ? litRef.current.delete(idx) : litRef.current.add(idx)
    draw()
  }

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    const idx = cellFromEvent(e)
    if (idx < 0 || litRef.current.has(idx)) return
    litRef.current.add(idx)
    draw()
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 cursor-crosshair"
      onMouseDown={(e) => { isDrawing.current = true; light(e) }}
      onMouseMove={onMove}
      onMouseUp={() => { isDrawing.current = false }}
      onMouseLeave={() => { isDrawing.current = false }}
      onTouchStart={(e) => { isDrawing.current = true; light(e) }}
      onTouchMove={onMove}
      onTouchEnd={() => { isDrawing.current = false }}
      style={{ touchAction: 'none' }}
    />
  )
}

const features = [
  {
    id: 'manual', num: '01', title: 'Manual Editor',
    desc: 'Blank canvas. Full tools. Pencil, fill, eyedropper, undo history, clean exports.',
    cta: 'Open Editor', href: '/create',
    accent: '#6c63ff', accentDim: 'rgba(108,99,255,0.12)',
    preview: ['#6c63ff','#4a3f99','#6c63ff','#9b8cff','#6c63ff','#4a3f99','#9b8cff','#6c63ff','#4a3f99'],
  },
  {
    id: 'convert', num: '02', title: 'Image → Pixel',
    desc: '128×128, 64-color palette. Nearest-neighbour downscaling. No blurry mosaic filters.',
    cta: 'Convert Image', href: '/generate/from-image',
    accent: '#ff6b35', accentDim: 'rgba(255,107,53,0.12)',
    preview: ['#ff6b35','#cc4a1a','#ff6b35','#ff9a6c','#ff6b35','#cc4a1a','#ff9a6c','#ff6b35','#cc4a1a'],
  },
  {
    id: 'avatar', num: '03', title: 'Pixel Avatar',
    desc: 'Upload your face. Walk out as a game character. Accessories, outfits, your vibe.',
    cta: 'Build Avatar', href: '/avatar',
    accent: '#00d4aa', accentDim: 'rgba(0,212,170,0.12)',
    preview: ['#00d4aa','#007a5e','#00d4aa','#00a882','#00d4aa','#007a5e','#00a882','#00d4aa','#007a5e'],
  },
]

const _ = '#0d0d1a', A = '#6c63ff', B = '#4a3f99', C = '#c4bfff', S = '#f5c5a3', H = '#3a2510'
const pixelPreview = [
  _,_,_,_,H,H,H,H,_,_,_,_,
  _,_,_,H,H,H,H,H,H,_,_,_,
  _,_,H,H,S,S,S,S,H,H,_,_,
  _,H,H,S,S,S,S,S,S,H,H,_,
  _,H,S,S,B,S,S,B,S,S,H,_,
  H,H,S,B,B,S,S,B,B,S,H,H,
  H,H,S,S,S,S,S,S,S,S,H,H,
  H,H,S,S,C,S,S,C,S,S,H,H,
  _,H,S,S,S,A,A,S,S,S,H,_,
  _,H,H,S,S,S,S,S,S,H,H,_,
  _,_,H,H,H,H,H,H,H,H,_,_,
  _,_,_,A,A,_,_,A,A,_,_,_,
]


export default function Home() {
  return (
    <main className="min-h-screen bg-[#07070d] text-white relative overflow-x-hidden">
      <PixelCanvas />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(108,99,255,0.13),transparent)]" />

      <Navbar />

      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/8">
          <span className="w-1.5 h-1.5 bg-[#6c63ff] animate-pulse" style={{ borderRadius: 0 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-[#6c63ff]/80 tracking-widest uppercase">
            pixel art, your way
          </span>
        </div>
        <h1 style={{ fontFamily: "'Press Start 2P', monospace" }}
          className="text-[24px] sm:text-[34px] md:text-[48px] leading-[1.65] text-[#f0f0fa] mb-7">
          turn anything<br />into <span className="text-[#6c63ff]">pixel art.</span>
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-[12px] md:text-[14px] text-white/35 max-w-lg mx-auto leading-loose mb-10">
          draw it. convert it. become it.<br className="hidden sm:block" />
          real tools. real pixel art. actually yours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#6c63ff] hover:bg-[#7b73ff] text-[12px] font-semibold transition-all shadow-[0_0_48px_rgba(108,99,255,0.3)] hover:shadow-[0_0_64px_rgba(108,99,255,0.45)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Start Creating →
          </Link>
          <Link href="/generate/from-image"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] hover:bg-white/[0.05] text-[12px] text-white/45 hover:text-white/70 transition-all"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Try Image Conversion
          </Link>
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/15 tracking-widest">
          ↑ the background is a canvas. click it.
        </p>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link key={f.id} href={f.href}
              className="group relative rounded-2xl border border-white/[0.07] bg-[#07070d]/70 backdrop-blur-sm p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = f.accent + '45'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${f.accent}15` }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: f.accent }} />
              <div className="grid grid-cols-3 gap-[2px] w-9 h-9 mb-5">
                {f.preview.map((c, i) => (
                  <div key={i} style={{ background: c, opacity: 0.55 + (i % 3) * 0.15, borderRadius: '1px' }} />
                ))}
              </div>
              <div className="flex items-start justify-between mb-3">
                <h3 style={{ fontFamily: "'Syne', sans-serif" }} className="text-[17px] font-black text-[#f0f0fa]">{f.title}</h3>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: f.accent }} className="text-[10px] opacity-50 mt-0.5">{f.num}</span>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-white/30 leading-relaxed mb-6">{f.desc}</p>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: f.accent }} className="text-[11px] flex items-center gap-1.5 group-hover:gap-3 transition-all duration-200">
                {f.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 pb-20">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/[0.06]">
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] tracking-[4px] uppercase text-[#6c63ff] mb-5 opacity-80">not another filter</span>
              <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-[26px] md:text-[36px] font-black leading-tight text-[#f0f0fa] mb-5">
                real pixel art.<br />not blurry grids.
              </h2>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[12px] text-white/30 leading-loose">
                most tools slap a mosaic filter and call it pixel art. we do actual palette reduction, grid-snapping, and nearest-neighbour downscaling — output that looks like it came from a game, not a photo editor.
              </p>
            </div>
            <div className="p-8 md:p-14 flex items-center justify-center bg-[#0a0a13]">
              <div className="flex items-center gap-8 w-full max-w-sm">
                <div className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#334] to-[#667] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_35%,rgba(200,180,160,0.4),transparent_55%)]" />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 uppercase tracking-widest">original</span>
                </div>
                <span className="text-white/15 text-lg flex-shrink-0">→</span>
                <div className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-[#6c63ff]/20" style={{ background: '#0d0d1a', padding: '3px' }}>
                    <div className="w-full h-full grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'repeat(12, 1fr)', gap: '1px' }}>
                      {pixelPreview.map((c, i) => <div key={i} style={{ background: c, borderRadius: '1px' }} />)}
                    </div>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-[#6c63ff]/50 uppercase tracking-widest">pixelized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 md:px-10 pb-24">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-white/[0.07] bg-[#0d0d18] p-10 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(108,99,255,0.14),transparent_60%)] pointer-events-none" />
          <h2 style={{ fontFamily: "'Press Start 2P', monospace" }} className="relative z-10 text-[16px] md:text-[24px] leading-[1.8] text-[#f0f0fa] mb-5">
            ready to build<br /><span className="text-[#6c63ff]">in pixels?</span>
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="relative z-10 text-[12px] text-white/25 leading-loose mb-8 max-w-sm mx-auto">
            free to start. no credit card. just open the canvas and go.
          </p>
          <Link href="/register"
            className="relative z-10 inline-flex px-8 py-3.5 rounded-xl bg-[#6c63ff] hover:bg-[#7b73ff] text-[12px] font-semibold transition-all shadow-[0_0_48px_rgba(108,99,255,0.3)]"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.04] px-5 md:px-10 py-5 flex flex-col md:flex-row gap-2 items-center justify-between">
        <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[8px] text-white/15">pixel.it</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/15">made for people who love art</span>
      </footer>
    </main>
  )
}