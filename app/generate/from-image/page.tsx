'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { convertImageToPixelArt, type ConversionResult } from '@/utils/imageToPixel'

const SIZE_OPTIONS = [
  { label: '32 × 32', value: 32 },
  { label: '64 × 64', value: 64 },
  { label: '128 × 128', value: 128 },
]

const COLOR_OPTIONS = [8, 16, 32, 64]

export default function FromImagePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [size, setSize] = useState(64)
  const [numColors, setNumColors] = useState(32)
  const [dithering, setDithering] = useState(false)
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState('')

  const loadFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('please upload an image file'); return }
    setFile(f)
    setResult(null)
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) loadFile(f)
  }, [])

  const handleConvert = async () => {
    if (!file) return
    setConverting(true)
    setError('')
    setResult(null)
    try {
      const res = await convertImageToPixelArt(file, {
        targetWidth: size,
        targetHeight: size,
        numColors,
        dithering,
      })
      setResult(res)
    } catch {
      setError('conversion failed — try a different image')
    } finally {
      setConverting(false)
    }
  }

  const handleOpenInEditor = () => {
    if (!result) return
    try {
      localStorage.setItem('pixelit_import', JSON.stringify({
        width: result.width,
        height: result.height,
        grid: result.grid,
      }))
      router.push('/create?from=import')
    } catch {
      setError('could not open in editor — try exporting instead')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = `pixelit-${size}x${size}.png`
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-white">

      <header className="flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#0c0c14]" style={{ height: 48 }}>
        <Link href="/">
          <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[9px] text-[#6c63ff]">
            pixel<span className="text-white">.it</span>
          </span>
        </Link>
        <span className="text-white/10">|</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-[#ff6b35]">
          image → pixel
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[28px] md:text-[36px] font-black text-[#f0f0fa] mb-2">
            image → pixel art
          </h1>
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[12px] text-white/30">
            nearest-neighbour downscaling + k-means palette reduction. no blurry filters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="flex flex-col gap-4">

            <div
              className="relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer"
              style={{
                borderColor: dragging ? '#ff6b35' : file ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)',
                background: dragging ? 'rgba(255,107,53,0.06)' : 'rgba(255,255,255,0.02)',
                minHeight: 200,
              }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
              />

              {preview ? (
                <div className="flex items-center gap-4 p-5">
                  <img src={preview} alt="upload preview"
                    className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                    style={{ imageRendering: 'auto' }} />
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      className="text-[12px] text-white/60 mb-1 truncate max-w-[200px]">
                      {file?.name}
                    </p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      className="text-[10px] text-white/25">
                      click to change
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 gap-3">
                  <span className="text-4xl opacity-20">🖼</span>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[12px] text-white/30 text-center">
                    drag & drop or click to upload
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[10px] text-white/15">
                    png, jpg, webp, gif
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-5">

              <div>
                <SectionLabel>output size</SectionLabel>
                <div className="flex gap-2 mt-2">
                  {SIZE_OPTIONS.map((o) => (
                    <button key={o.value} onClick={() => setSize(o.value)}
                      className="flex-1 py-2 rounded-lg text-[11px] transition-all"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        background: size === o.value ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${size === o.value ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        color: size === o.value ? '#ff9a6c' : 'rgba(255,255,255,0.35)',
                      }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>palette colors</SectionLabel>
                <div className="flex gap-2 mt-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c} onClick={() => setNumColors(c)}
                      className="flex-1 py-2 rounded-lg text-[11px] transition-all"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        background: numColors === c ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${numColors === c ? 'rgba(255,107,53,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        color: numColors === c ? '#ff9a6c' : 'rgba(255,255,255,0.35)',
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <SectionLabel>floyd-steinberg dithering</SectionLabel>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[10px] text-white/20 mt-0.5">
                    smoother gradients, more natural look
                  </p>
                </div>
                <button
                  onClick={() => setDithering(!dithering)}
                  className="w-10 h-5 rounded-full transition-all flex-shrink-0 relative"
                  style={{ background: dithering ? '#ff6b35' : 'rgba(255,255,255,0.1)' }}
                >
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: dithering ? '50%' : '2px' }} />
                </button>
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!file || converting}
              className="w-full py-4 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-30"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: file && !converting ? '#ff6b35' : 'rgba(255,107,53,0.2)',
                color: file && !converting ? '#fff' : 'rgba(255,255,255,0.3)',
                boxShadow: file && !converting ? '0 0 40px rgba(255,107,53,0.3)' : 'none',
              }}
            >
              {converting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">◐</span>
                  converting...
                </span>
              ) : 'convert →'}
            </button>

            {error && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-[11px] text-red-400/80 text-center">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {result ? (
              <>
                <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a13] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        className="text-[9px] text-white/20 uppercase tracking-widest">original</p>
                      {preview && (
                        <img src={preview} alt="original"
                          className="w-full max-w-[180px] aspect-square object-cover rounded-xl" />
                      )}
                    </div>

                    <span className="text-white/15 text-xl flex-shrink-0">→</span>

                    <div className="flex-1 flex flex-col items-center gap-2">
                      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        className="text-[9px] text-[#ff6b35]/60 uppercase tracking-widest">pixelized</p>
                      <img
                        src={result.dataUrl}
                        alt="pixel art result"
                        className="w-full max-w-[180px] aspect-square rounded-xl"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-4">
                    <Chip>{result.width} × {result.height}</Chip>
                    <Chip>{result.palette.length} colors</Chip>
                    {dithering && <Chip>dithered</Chip>}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <SectionLabel>extracted palette</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {result.palette.map((c) => (
                      <div key={c} title={c}
                        className="w-7 h-7 rounded-md border border-white/10 cursor-pointer transition-transform hover:scale-125"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleOpenInEditor}
                    className="flex-1 py-3.5 rounded-xl text-[12px] font-semibold transition-all"
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
                    className="flex-1 py-3.5 rounded-xl text-[12px] font-semibold transition-all"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: 'rgba(46,204,113,0.15)',
                      border: '1px solid rgba(46,204,113,0.3)',
                      color: '#2ecc71',
                    }}>
                    ↓ download png
                  </button>
                </div>

                <button onClick={handleConvert}
                  className="text-[10px] text-white/20 hover:text-white/40 transition-colors text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  tweak settings and reconvert →
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/[0.06] flex items-center justify-center"
                style={{ minHeight: 320 }}>
                <div className="text-center">
                  <span className="text-5xl opacity-10">◧</span>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[11px] text-white/15 mt-4">
                    result appears here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="text-[10px] text-white/25 uppercase tracking-widest">
      {children}
    </p>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] text-white/30 px-2.5 py-1 rounded-full"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
      {children}
    </span>
  )
}