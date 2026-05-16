'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  drawAvatar, sampleColorsFromImage, avatarToGrid,
  DEFAULT_OPTIONS, type AvatarOptions,
} from '@/utils/drawAvatar'

const HAIR_LABELS = ['Short', 'Medium', 'Long']
const ACCESSORIES = ['none', 'headphones', 'glasses', 'hat'] as const
const ACC_LABELS = { none: 'None', headphones: '🎧 Headphones', glasses: '👓 Glasses', hat: '🧢 Hat' }

const BG_PRESETS = ['#111118', '#0a0a0f', '#1a0a0a', '#0a1a0a', '#0a0a1a', '#1a1a0a']
const CLOTHES_PRESETS = ['#2d2d4a', '#1a2a3a', '#2a1a1a', '#1a2a1a', '#3a2a1a', '#2a2a2a']

export default function AvatarPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [opts, setOpts] = useState<AvatarOptions>(DEFAULT_OPTIONS)
  const [uploading, setUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawAvatar(canvas, opts)
  }, [opts])

  const set = useCallback(<K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => {
    setOpts(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    try {
      const { skinColor, hairColor } = await sampleColorsFromImage(file)
      setOpts(prev => ({ ...prev, skinColor, hairColor }))
    } catch { /* use defaults */ }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handlePhotoUpload(f)
  }

  const handleOpenInEditor = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const grid = avatarToGrid(canvas)
    try {
      localStorage.setItem('pixelit_import', JSON.stringify({ width: 32, height: 32, grid }))
      router.push('/create?from=import')
    } catch { /* ignore */ }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url; a.download = 'pixelit-avatar.png'; a.click()
  }

  const handleReset = () => setOpts(DEFAULT_OPTIONS)

  return (
    <div className="min-h-screen bg-[#07070d] text-white">

      <header className="flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#0c0c14]" style={{ height: 48 }}>
        <Link href="/">
          <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[9px] text-[#6c63ff]">
            pixel<span className="text-white">.it</span>
          </span>
        </Link>
        <span className="text-white/10">|</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-[#00d4aa]">
          pixel avatar
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[28px] md:text-[36px] font-black text-[#f0f0fa] mb-2">
            pixel avatar builder
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[12px] text-white/30">
            upload your face to auto-sample colors, then customize your character.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div
              className="rounded-2xl border-2 border-dashed cursor-pointer transition-all p-4"
              style={{
                borderColor: dragging ? '#00d4aa' : 'rgba(255,255,255,0.07)',
                background: dragging ? 'rgba(0,212,170,0.05)' : 'rgba(255,255,255,0.02)',
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }} />
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.15)' }}>
                    <span className="text-2xl opacity-40">🤳</span>
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[12px] text-white/50">
                    {uploading ? 'sampling colors...' : photoPreview ? 'photo loaded — colors sampled' : 'upload selfie to auto-sample skin & hair'}
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[10px] text-white/20 mt-0.5">
                    optional — you can also pick colors manually below
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Section title="colors">
                <ColorRow label="skin" value={opts.skinColor} onChange={(v) => set('skinColor', v)} />
                <ColorRow label="hair" value={opts.hairColor} onChange={(v) => set('hairColor', v)} />
                <ColorRow label="eyes" value={opts.eyeColor} onChange={(v) => set('eyeColor', v)} />

                <div className="mt-3">
                  <Label>background</Label>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {BG_PRESETS.map((c) => (
                      <button key={c} onClick={() => set('bgColor', c)}
                        className="w-6 h-6 rounded-md border transition-transform hover:scale-110"
                        style={{
                          background: c,
                          borderColor: opts.bgColor === c ? '#00d4aa' : 'rgba(255,255,255,0.1)',
                          outline: opts.bgColor === c ? '1px solid #00d4aa' : 'none',
                          outlineOffset: 1,
                        }} />
                    ))}
                    <input type="color" value={opts.bgColor}
                      onChange={(e) => set('bgColor', e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                      title="custom background color" />
                  </div>
                </div>

                <div className="mt-3">
                  <Label>clothes</Label>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {CLOTHES_PRESETS.map((c) => (
                      <button key={c} onClick={() => set('clothesColor', c)}
                        className="w-6 h-6 rounded-md border transition-transform hover:scale-110"
                        style={{
                          background: c,
                          borderColor: opts.clothesColor === c ? '#00d4aa' : 'rgba(255,255,255,0.1)',
                          outline: opts.clothesColor === c ? '1px solid #00d4aa' : 'none',
                          outlineOffset: 1,
                        }} />
                    ))}
                    <input type="color" value={opts.clothesColor}
                      onChange={(e) => set('clothesColor', e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden"
                      title="custom clothes color" />
                  </div>
                </div>
              </Section>

              <Section title="style">
                <Label>hair style</Label>
                <div className="flex gap-2 mt-1.5">
                  {HAIR_LABELS.map((label, i) => (
                    <button key={i} onClick={() => set('hairStyle', i)}
                      className="flex-1 py-2 rounded-lg text-[11px] transition-all"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        background: opts.hairStyle === i ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${opts.hairStyle === i ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        color: opts.hairStyle === i ? '#00d4aa' : 'rgba(255,255,255,0.35)',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <Label>accessory</Label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {ACCESSORIES.map((acc) => (
                      <button key={acc} onClick={() => set('accessory', acc)}
                        className="py-2 px-3 rounded-lg text-[11px] text-left transition-all"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          background: opts.accessory === acc ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${opts.accessory === acc ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`,
                          color: opts.accessory === acc ? '#00d4aa' : 'rgba(255,255,255,0.35)',
                        }}>
                        {ACC_LABELS[acc]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Label>beard</Label>
                  <button
                    onClick={() => set('beard', !opts.beard)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: opts.beard ? '#00d4aa' : 'rgba(255,255,255,0.1)' }}
                  >
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: opts.beard ? '50%' : '2px' }} />
                  </button>
                </div>
              </Section>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a13] p-6 flex flex-col items-center gap-4">
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-[9px] text-white/20 uppercase tracking-widest self-start">
                preview
              </p>

              <div className="flex items-center justify-center rounded-xl overflow-hidden"
                style={{ width: 256, height: 256, background: opts.bgColor, imageRendering: 'pixelated' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    imageRendering: 'pixelated',
                    width: 256, height: 256,
                  }}
                />
              </div>

              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-[9px] text-white/15 text-center">
                32 × 32 pixel character
              </p>
            </div>

            <button
              onClick={handleOpenInEditor}
              className="w-full py-3.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(108,99,255,0.2)',
                border: '1px solid rgba(108,99,255,0.4)',
                color: '#9b8cff',
              }}>
              ✏️ open in editor
            </button>

            <button
              onClick={handleDownload}
              className="w-full py-3.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(0,212,170,0.15)',
                border: '1px solid rgba(0,212,170,0.3)',
                color: '#00d4aa',
              }}>
              ↓ download png
            </button>

            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl text-[11px] transition-all text-white/20 hover:text-white/40"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.05)',
              }}>
              reset to defaults
            </button>

            {/* note about assets */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.12)' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-[10px] text-[#00d4aa]/60 leading-loose">
                character templates are programmatically generated. custom sprite assets coming in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-3">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
        className="text-[10px] text-white/25 uppercase tracking-widest">
        {title}
      </p>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="text-[10px] text-white/30">
      {children}
    </p>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-[9px] text-white/20">{value.toUpperCase()}</span>
        <input
          type="color" value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
          style={{ background: 'transparent' }}
        />
        <div className="w-7 h-7 rounded-lg border border-white/10 pointer-events-none flex-shrink-0"
          style={{ background: value }} />
      </div>
    </div>
  )
}