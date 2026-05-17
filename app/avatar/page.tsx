'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { compositeAvatar, buildLayers, type ColorMap, type AvatarSpec } from '@/utils/spriteRecolor'

const DISPLAY = 288
type Gender = 'male' | 'female'
type Colors = ColorMap & { bg: string }

const DEFAULTS: Record<Gender, { colors: Colors; spec: Omit<AvatarSpec, 'gender'> }> = {
  male: {
    colors: { skin: '#c8956a', hair: '#4a2e1a', clothes: '#1e1e2e', bg: '#111118' },
    spec:   { hairStyle: 1, accessory: 'headphones', beard: true },
  },
  female: {
    colors: { skin: '#d4a882', hair: '#3a1a0a', clothes: '#c0394a', bg: '#f0e4d0' },
    spec:   { hairStyle: 0, accessory: 'glasses', beard: false },
  },
}

const HAIR_LABELS: Record<Gender, string[]> = {
  male:   ['Short', 'Medium', 'Swept'],
  female: ['Bob', 'Long'],
}

const ACCESSORIES = ['none', 'glasses', 'headphones', 'hat'] as const
const ACC_LABELS  = { none: 'None', glasses: '👓 Glasses', headphones: '🎧 Headphones', hat: '🧢 Hat' }
const BG_PRESETS  = ['#111118', '#0a0a0f', '#f0e4d0', '#1a2a1a', '#1a0a1a', '#2a1a0a']

export default function AvatarPage() {
  const router   = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendering = useRef(false)

  const [gender, setGender] = useState<Gender>('male')
  const [colors, setColors] = useState<Colors>(DEFAULTS.male.colors)
  const [spec, setSpec]     = useState<Omit<AvatarSpec,'gender'>>(DEFAULTS.male.spec)
  const [loading, setLoading] = useState(false)

  const setColor = useCallback(<K extends keyof Colors>(k: K, v: Colors[K]) =>
    setColors(prev => ({ ...prev, [k]: v })), [])

  const setOpt = useCallback(<K extends keyof typeof spec>(k: K, v: typeof spec[K]) =>
    setSpec(prev => ({ ...prev, [k]: v })), [])

  const switchGender = (g: Gender) => {
    setGender(g)
    setColors(DEFAULTS[g].colors)
    setSpec(DEFAULTS[g].spec)
  }
 
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || rendering.current) return
    rendering.current = true
    setLoading(true)

    compositeAvatar(
      canvas,
      buildLayers({ gender, ...spec }),
      { skin: colors.skin, hair: colors.hair, clothes: colors.clothes },
      colors.bg,
      DISPLAY
    ).finally(() => { rendering.current = false; setLoading(false) })
  }, [gender, colors, spec])

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `pixelit-avatar-${gender}.png`; a.click()
  }

  const handleOpenInEditor = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const SIZE = 48, cell = canvas.width / SIZE
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const grid: (string | null)[] = []

    for (let py = 0; py < SIZE; py++) {
      for (let px2 = 0; px2 < SIZE; px2++) {
        const ax = Math.floor(px2 * cell + cell/2)
        const ay = Math.floor(py * cell + cell/2)
        const i  = (ay * canvas.width + ax) * 4
        const r  = imageData.data[i], g = imageData.data[i+1]
        const b  = imageData.data[i+2], a = imageData.data[i+3]
        if (a < 20) {
          grid.push(null)
        } else {
          grid.push(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`)
        }
      }
    }
    localStorage.setItem('pixelit_import', JSON.stringify({ width: SIZE, height: SIZE, grid }))
    router.push('/create?from=import')
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      <header className="flex items-center gap-4 px-6 border-b border-white/[0.06] bg-[#0c0c14]" style={{ height: 48 }}>
        <Link href="/"><span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[9px] text-[#6c63ff]">pixel<span className="text-white">.it</span></span></Link>
        <span className="text-white/10">|</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[11px] text-[#00d4aa]">pixel avatar</span>
      </header>

      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-[28px] md:text-[36px] font-black text-[#f0f0fa] mb-2">
              pixel avatar builder
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[12px] text-white/30">
              pick your style. customize colors. download or edit in the canvas.
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['male','female'] as Gender[]).map(g => (
              <button key={g} onClick={() => switchGender(g)}
                className="px-6 py-2 rounded-lg text-[11px] font-semibold transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace", background: gender===g ? '#00d4aa' : 'transparent', color: gender===g ? '#07070d' : 'rgba(255,255,255,0.4)' }}>
                {g==='male' ? '♂ male' : '♀ female'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Panel title="colors">
              <ColorRow label="skin"    value={colors.skin}    onChange={v => setColor('skin', v)} />
              <ColorRow label="hair"    value={colors.hair}    onChange={v => setColor('hair', v)} />
              <ColorRow label="clothes" value={colors.clothes} onChange={v => setColor('clothes', v)} />
              <div className="mt-2">
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 mb-2">background</p>
                <div className="flex gap-1.5 flex-wrap">
                  {BG_PRESETS.map(c => (
                    <button key={c} onClick={() => setColor('bg', c)}
                      className="w-6 h-6 rounded-md border transition-transform hover:scale-110"
                      style={{ background: c, borderColor: colors.bg===c ? '#00d4aa' : 'rgba(255,255,255,0.1)', outline: colors.bg===c ? '1px solid #00d4aa' : 'none', outlineOffset: 1 }} />
                  ))}
                  <input type="color" value={colors.bg} onChange={e => setColor('bg', e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden" title="custom" />
                </div>
              </div>
            </Panel>

            <Panel title="style">
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 mb-1.5">hair</p>
                <div className="flex gap-1.5">
                  {HAIR_LABELS[gender].map((label, i) => (
                    <button key={i} onClick={() => setOpt('hairStyle', i)}
                      className="flex-1 py-2 rounded-lg text-[11px] transition-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace",
                        background: spec.hairStyle===i ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${spec.hairStyle===i ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        color: spec.hairStyle===i ? '#00d4aa' : 'rgba(255,255,255,0.35)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 mb-1.5">accessory</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ACCESSORIES.map(acc => (
                    <button key={acc} onClick={() => setOpt('accessory', acc)}
                      className="py-2 px-2 rounded-lg text-[11px] text-left transition-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace",
                        background: spec.accessory===acc ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${spec.accessory===acc ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`,
                        color: spec.accessory===acc ? '#00d4aa' : 'rgba(255,255,255,0.35)' }}>
                      {ACC_LABELS[acc]}
                    </button>
                  ))}
                </div>
              </div>

              {gender === 'male' && (
                <div className="flex items-center justify-between mt-3">
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20">beard</p>
                  <button onClick={() => setOpt('beard', !spec.beard)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: spec.beard ? '#00d4aa' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: spec.beard ? '50%' : '2px' }} />
                  </button>
                </div>
              )}
            </Panel>

            <Panel title="skin tone presets">
              <div className="grid grid-cols-6 gap-2">
                {SKIN_PRESETS.map(({ skin, label }) => (
                  <button key={skin} onClick={() => setColor('skin', skin)}
                    title={label}
                    className="aspect-square rounded-lg border-2 transition-transform hover:scale-110"
                    style={{ background: skin, borderColor: colors.skin===skin ? '#00d4aa' : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </Panel>

            <Panel title="hair color presets">
              <div className="grid grid-cols-6 gap-2">
                {HAIR_PRESETS.map(({ hair, label }) => (
                  <button key={hair} onClick={() => setColor('hair', hair)}
                    title={label}
                    className="aspect-square rounded-lg border-2 transition-transform hover:scale-110"
                    style={{ background: hair, borderColor: colors.hair===hair ? '#00d4aa' : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </Panel>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a13] p-5 flex flex-col items-center gap-4">
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 uppercase tracking-widest self-start">
                preview
              </p>
              <div className="relative rounded-xl overflow-hidden" style={{ width: DISPLAY, height: DISPLAY, maxWidth: '100%', background: colors.bg }}>
                <canvas ref={canvasRef}
                  style={{ imageRendering: 'pixelated', width: DISPLAY, height: DISPLAY, maxWidth: '100%', display: 'block' }} />
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/50 animate-pulse">rendering...</span>
                  </div>
                )}
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/15">
                48 × 48 sprite character
              </p>
            </div>

            <button onClick={handleOpenInEditor}
              className="w-full py-3.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)', color: '#9b8cff' }}>
              ✏️ open in editor
            </button>

            <button onClick={handleDownload}
              className="w-full py-3.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace", background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', color: '#00d4aa' }}>
              ↓ download png
            </button>

            <button onClick={() => { setColors(DEFAULTS[gender].colors); setSpec(DEFAULTS[gender].spec) }}
              className="w-full py-2.5 rounded-xl text-[11px] text-white/20 hover:text-white/40 transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace", border: '1px solid rgba(255,255,255,0.05)' }}>
              reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-2">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/25 uppercase tracking-widest mb-1">{title}</p>
      {children}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/30">{label}</p>
      <div className="flex items-center gap-1.5">
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20">{value.toUpperCase()}</span>
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden" />
        <div className="w-6 h-6 rounded-md border border-white/10 flex-shrink-0" style={{ background: value }} />
      </div>
    </div>
  )
}

const SKIN_PRESETS = [
  { skin: '#f5d5b0', label: 'Fair'       },
  { skin: '#e8b88a', label: 'Light'      },
  { skin: '#c8956a', label: 'Medium'     },
  { skin: '#a8734a', label: 'Tan'        },
  { skin: '#7a4a2a', label: 'Brown'      },
  { skin: '#4a2810', label: 'Dark'       },
  { skin: '#d4a882', label: 'Warm peach' },
  { skin: '#c4956a', label: 'Olive'      },
  { skin: '#b8846a', label: 'Bronze'     },
  { skin: '#f0c8a0', label: 'Ivory'      },
  { skin: '#dca87a', label: 'Golden'     },
  { skin: '#8a5a38', label: 'Mahogany'   },
]

const HAIR_PRESETS = [
  { hair: '#111111', label: 'Black'      },
  { hair: '#2d1c22', label: 'Dark brown' },
  { hair: '#4a2e1a', label: 'Brown'      },
  { hair: '#7a4a20', label: 'Auburn'     },
  { hair: '#c87820', label: 'Ginger'     },
  { hair: '#e8b840', label: 'Dirty blonde'},
  { hair: '#f0d878', label: 'Blonde'     },
  { hair: '#f8f0d8', label: 'Platinum'   },
  { hair: '#888888', label: 'Grey'       },
  { hair: '#e83060', label: 'Pink'       },
  { hair: '#2040c8', label: 'Blue'       },
  { hair: '#18a848', label: 'Green'      },
]