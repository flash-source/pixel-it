'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { renderSprite, buildSpritePaths, type SpriteOptions } from '@/utils/spriteRecolor'

const DISPLAY_SIZE = 288   

type Gender = 'male' | 'female'

type Colors = {
  skin: string
  hair: string
  clothes: string
  bg: string
  accessory: string
}

const DEFAULTS: Record<Gender, Colors> = {
  male: {
    skin: '#d4956a', hair: '#3a1f08',
    clothes: '#1e1e2e', bg: '#111118', accessory: '#666666',
  },
  female: {
    skin: '#e8b89a', hair: '#1a0d06',
    clothes: '#1a1a1a', bg: '#f0e4d0', accessory: '#666666',
  },
}

const SPRITE_OPTIONS_DEFAULT: Record<Gender, SpriteOptions> = {
  male: { gender: 'male', hairStyle: 1, accessory: 'headphones', beard: true },
  female: { gender: 'female', hairStyle: 0, accessory: 'glasses', beard: false },
}

const HAIR_LABELS: Record<Gender, string[]> = {
  male: ['Short', 'Medium', 'Swept'],
  female: ['Bob', 'Long'],
}

const ACCESSORIES = ['none', 'glasses', 'headphones', 'hat'] as const
const ACC_LABELS = { none: 'None', glasses: '👓 Glasses', headphones: '🎧 Headphones', hat: '🧢 Hat' }

const BG_PRESETS = ['#111118', '#0a0a0f', '#f0e4d0', '#1a0a0a', '#0a1a0a', '#e8e0f0']
const CLOTHES_PRESETS = ['#1e1e2e', '#1a2a3a', '#2a1a1a', '#1a2a1a', '#3a2a1a', '#2a2a2a']

function drawFallback(
  canvas: HTMLCanvasElement,
  gender: Gender,
  colors: Colors,
  spriteOpts: SpriteOptions
) {
  canvas.width = DISPLAY_SIZE
  canvas.height = DISPLAY_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  const cell = DISPLAY_SIZE / 48

  const fill = (cells: [number,number][], color: string) => {
    ctx.fillStyle = color
    for (const [x, y] of cells) {
      if (x < 0 || y < 0 || x >= 48 || y >= 48) continue
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }
  }

  const r = (y: number, x1: number, x2: number): [number,number][] => {
    const out: [number,number][] = []
    for (let x = x1; x <= x2; x++) out.push([x, y])
    return out
  }

  const S = colors.skin, H = colors.hair, C = colors.clothes

  const darker = (hex: string, n: number) => {
    const v = parseInt(hex.replace('#',''), 16)
    const rr = Math.max(0, ((v>>16)&0xff) - n)
    const gg = Math.max(0, ((v>>8)&0xff) - n)
    const bb = Math.max(0, (v&0xff) - n)
    return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`
  }

  ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, DISPLAY_SIZE, DISPLAY_SIZE)

  fill([...r(33,12,35),...r(34,10,37),...r(35,8,39),...r(36,6,41),...r(37,5,42),
        ...r(38,4,43),...r(39,3,44),...r(40,2,45),...r(41,2,45),...r(42,1,46),...r(43,0,47),...r(44,0,47),...r(45,0,47),...r(46,0,47),...r(47,0,47)], C)

  fill([...r(29,20,27),...r(30,20,27),...r(31,20,27),...r(32,20,27)], S)

  fill([...r(9,14,33),...r(10,13,34),...r(11,13,34),...r(12,13,34),...r(13,13,34),
        ...r(14,12,35),...r(15,12,35),...r(16,12,35),...r(17,12,35),...r(18,12,35),
        ...r(19,12,35),...r(20,12,35),...r(21,13,34),...r(22,13,34),...r(23,13,34),
        ...r(24,14,33),...r(25,15,32),...r(26,16,31),...r(27,17,30),...r(28,18,29)], S)

  if (gender === 'female') {
    fill([...r(3,16,31),...r(4,14,33),...r(5,12,35),...r(6,11,36),...r(7,11,36),
          ...r(8,11,36),...r(9,11,14),...r(9,33,36),...r(10,11,14),...r(10,33,36),
          ...r(11,10,14),...r(11,33,37),...r(12,10,14),...r(12,33,37),
          ...r(13,10,14),...r(13,33,37),...r(14,10,14),...r(14,33,37),
          ...r(15,10,14),...r(15,33,37),...r(16,10,13),...r(16,33,37),
          ...r(17,10,13),...r(17,33,37),...r(18,10,13),...r(18,33,37),
          ...r(19,10,13),...r(19,33,36),...r(20,10,13),...r(20,33,36),
          ...r(21,10,13),...r(21,33,36),...r(22,11,14),...r(22,33,36),
          ...r(23,12,15),...r(23,33,35),...r(24,13,16),...r(24,32,35),
          ...r(25,14,17),...r(25,31,34)], H)
  } else {
    const hs = spriteOpts.hairStyle
    if (hs === 0) {
      fill([...r(4,15,32),...r(5,13,34),...r(6,12,35),...r(7,11,36),...r(8,11,36),...r(9,11,15),...r(9,32,36)], H)
    } else {
      fill([...r(2,16,31),...r(3,13,34),...r(4,12,35),...r(5,11,36),...r(6,10,37),
            ...r(7,10,37),...r(8,10,37),...r(9,10,14),...r(9,33,37)], H)
    }
  }

  fill([...r(14,14,20),...r(15,14,20),...r(16,14,20)], '#d8d4c8')
  fill([...r(14,15,19),...r(15,15,19),...r(16,15,19)], '#555577')
  fill([[15,17],[16,17],[15,18],[16,18]], '#111')
  fill([[14,15]], '#fff')
  fill([...r(14,27,33),...r(15,27,33),...r(16,27,33)], '#d8d4c8')
  fill([...r(14,28,32),...r(15,28,32),...r(16,28,32)], '#555577')
  fill([[15,30],[16,30],[15,31],[16,31]], '#111')
  fill([[14,31]], '#fff')

  fill([...r(11,14,19),...r(12,14,19),...r(11,28,33),...r(12,28,33)], darker(H, 5))

  fill([[22,22],[22,25],[23,22],[23,23],[23,24],[23,25]], darker(S, 30))

  fill([...r(25,20,27)], darker(S, 20))
  fill([...r(26,21,26)], '#a06055')

  if (gender === 'male' && spriteOpts.beard) {
    fill([...r(23,18,28),...r(24,16,30),...r(25,15,32),...r(26,15,32),...r(27,16,31),...r(28,17,30)], darker(H, 5))
    fill([...r(25,20,27)], darker(S, 20))
    fill([...r(26,21,26)], '#a06055')
  }

  if (spriteOpts.accessory === 'glasses') {
    fill([...r(12,13,21),...r(17,13,21),...r(12,26,34),...r(17,26,34)], '#888')
    for (let y = 13; y <= 16; y++) { fill([[y,13],[y,21]], '#888'); fill([[y,26],[y,34]], '#888') }
    fill([...r(14,22,25)], '#888')
    ctx.globalAlpha = 0.15; fill([...r(13,14,20),...r(14,14,20),...r(15,14,20),...r(16,14,20)], '#88aaff')
    fill([...r(13,27,33),...r(14,27,33),...r(15,27,33),...r(16,27,33)], '#88aaff'); ctx.globalAlpha = 1
  }

  if (spriteOpts.accessory === 'headphones') {
    fill([...r(2,14,33)], '#555')
    fill([...r(11,7,12),...r(12,7,12),...r(13,7,12),...r(14,7,12),...r(15,7,12),...r(16,7,12),...r(17,7,12),...r(18,7,12),...r(19,7,12)], '#333')
    fill([...r(11,35,40),...r(12,35,40),...r(13,35,40),...r(14,35,40),...r(15,35,40),...r(16,35,40),...r(17,35,40),...r(18,35,40),...r(19,35,40)], '#333')
    fill([[12,8],[12,9],[12,10],[13,8],[13,9],[13,10]], '#555')
    fill([[12,37],[12,38],[12,39],[13,37],[13,38],[13,39]], '#555')
  }
  if (spriteOpts.accessory === 'hat') {
  fill([...r(33,14,16),...r(33,31,33)], darker(C, 25))
  fill([...r(33,17,30)], colors.clothes)
}
}

export default function AvatarPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [gender, setGender] = useState<Gender>('male')
  const [colors, setColors] = useState<Colors>(DEFAULTS.male)
  const [spriteOpts, setSpriteOpts] = useState<SpriteOptions>(SPRITE_OPTIONS_DEFAULT.male)
  const [spritesAvailable, setSpritesAvailable] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const setColor = useCallback(<K extends keyof Colors>(key: K, value: Colors[K]) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }, [])

  const setOpt = useCallback(<K extends keyof SpriteOptions>(key: K, value: SpriteOptions[K]) => {
    setSpriteOpts((prev: SpriteOptions) => ({ ...prev, [key]: value }))
  }, [])

  const switchGender = (g: Gender) => {
    setGender(g)
    setColors(DEFAULTS[g])
    setSpriteOpts({ ...SPRITE_OPTIONS_DEFAULT[g] })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (spritesAvailable) {
      const paths = buildSpritePaths(spriteOpts)
      renderSprite(canvas, paths, {
        skin: colors.skin, hair: colors.hair,
        clothes: colors.clothes, accessory: colors.accessory,
      }, colors.bg, DISPLAY_SIZE).catch(() => {
        drawFallback(canvas, gender, colors, spriteOpts)
      })
    } else {
      drawFallback(canvas, gender, colors, spriteOpts)
    }
  }, [gender, colors, spriteOpts, spritesAvailable])

  useEffect(() => {
    fetch(`/avatars/${gender}/face.png`, { method: 'HEAD' })
      .then(r => setSpritesAvailable(r.ok))
      .catch(() => setSpritesAvailable(false))
  }, [gender])

  const handlePhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, 64, 64)
      URL.revokeObjectURL(url)
      const sd = ctx.getImageData(20, 22, 24, 18).data
      let sr = 0, sg = 0, sb = 0, sc = 0
      for (let i = 0; i < sd.length; i += 4) { sr += sd[i]; sg += sd[i+1]; sb += sd[i+2]; sc++ }
      const hd = ctx.getImageData(18, 2, 28, 14).data
      let hr = 0, hg = 0, hb = 0, hc = 0
      for (let i = 0; i < hd.length; i += 4) { hr += hd[i]; hg += hd[i+1]; hb += hd[i+2]; hc++ }
      const toH = (r: number, g: number, b: number) => `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`
      setColors(prev => ({ ...prev, skin: toH(sr/sc, sg/sc, sb/sc), hair: toH(hr/hc, hg/hc, hb/hc) }))
    }
    img.src = url
  }

  const handleDownload = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png')
    a.download = `pixelit-avatar-${gender}.png`; a.click()
  }

  const handleOpenInEditor = () => {
    const canvas = canvasRef.current; if (!canvas) return
    const SIZE = 48
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const grid: string[] = []
    const cell = canvas.width / SIZE
    for (let py = 0; py < SIZE; py++) {
      for (let px2 = 0; px2 < SIZE; px2++) {
        const ax = Math.floor(px2 * cell + cell/2)
        const ay = Math.floor(py * cell + cell/2)
        const i = (ay * canvas.width + ax) * 4
        const rr = imageData.data[i], gg = imageData.data[i+1], bb = imageData.data[i+2]
        grid.push(`#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`)
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
            <h1 style={{ fontFamily: "'Syne', sans-serif" }} className="text-[28px] md:text-[36px] font-black text-[#f0f0fa] mb-2">pixel avatar builder</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[12px] text-white/30">customize your character. upload your photo to sample colors.</p>
          </div>
      
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <button key={g} onClick={() => switchGender(g)}
                className="px-5 py-2 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: gender === g ? '#00d4aa' : 'transparent',
                  color: gender === g ? '#07070d' : 'rgba(255,255,255,0.4)',
                }}>
                {g === 'male' ? '♂ male' : '♀ female'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="sm:col-span-2 rounded-2xl border-2 border-dashed cursor-pointer transition-all p-4"
              style={{ borderColor: dragging ? '#00d4aa' : 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handlePhoto(f) }}>
              <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhoto(f) }} />
              <div className="flex items-center gap-4">
                {photoPreview
                  ? <img src={photoPreview} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl opacity-30" style={{ background: 'rgba(0,212,170,0.1)' }}>🤳</div>}
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[12px] text-white/50">{photoPreview ? 'photo loaded — colors sampled ✓' : 'upload selfie to auto-sample colors'}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[10px] text-white/20 mt-0.5">optional — pick colors manually below</p>
                </div>
              </div>
            </div>

            <Panel title="colors">
              <ColorRow label="skin" value={colors.skin} onChange={(v) => setColor('skin', v)} />
              <ColorRow label="hair" value={colors.hair} onChange={(v) => setColor('hair', v)} />
              <ColorRow label="clothes" value={colors.clothes} onChange={(v) => setColor('clothes', v)} />
              <ColorRow label="accessory" value={colors.accessory} onChange={(v) => setColor('accessory', v)} />
              <div className="mt-1">
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 mb-1.5">background</p>
                <div className="flex gap-1.5 flex-wrap">
                  {BG_PRESETS.map(c => (
                    <button key={c} onClick={() => setColor('bg', c)} className="w-6 h-6 rounded-md border transition-transform hover:scale-110"
                      style={{ background: c, borderColor: colors.bg === c ? '#00d4aa' : 'rgba(255,255,255,0.1)', outline: colors.bg === c ? '1px solid #00d4aa' : 'none', outlineOffset: 1 }} />
                  ))}
                  <input type="color" value={colors.bg} onChange={(e) => setColor('bg', e.target.value)}
                    className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden" title="custom bg" />
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
                      style={{ fontFamily: "'JetBrains Mono', monospace", background: spriteOpts.hairStyle === i ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${spriteOpts.hairStyle === i ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`, color: spriteOpts.hairStyle === i ? '#00d4aa' : 'rgba(255,255,255,0.35)' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 mb-1.5 mt-3">accessory</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {ACCESSORIES.map(acc => (
                    <button key={acc} onClick={() => setOpt('accessory', acc)}
                      className="py-2 px-2 rounded-lg text-[11px] text-left transition-all"
                      style={{ fontFamily: "'JetBrains Mono', monospace", background: spriteOpts.accessory === acc ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${spriteOpts.accessory === acc ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.07)'}`, color: spriteOpts.accessory === acc ? '#00d4aa' : 'rgba(255,255,255,0.35)' }}>
                      {ACC_LABELS[acc]}
                    </button>
                  ))}
                </div>
              </div>

              {gender === 'male' && (
                <div className="flex items-center justify-between mt-3">
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20">beard</p>
                  <button onClick={() => setOpt('beard', !spriteOpts.beard)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: spriteOpts.beard ? '#00d4aa' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: spriteOpts.beard ? '50%' : '2px' }} />
                  </button>
                </div>
              )}

              {!spritesAvailable && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-[#ff6b35]/70 leading-relaxed">
                    sprite PNGs not found — showing fallback. add your PNGs to <code className="opacity-60">/public/avatars/{gender}/</code>
                  </p>
                </div>
              )}
            </Panel>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a13] p-5 flex flex-col items-center gap-4">
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/20 uppercase tracking-widest self-start">preview</p>
              <div className="rounded-xl overflow-hidden" style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE, maxWidth: '100%', imageRendering: 'pixelated', background: colors.bg }}>
                <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', width: DISPLAY_SIZE, height: DISPLAY_SIZE, maxWidth: '100%' }} />
              </div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-[9px] text-white/15">48 × 48 pixel character</p>
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

            <button onClick={() => { setColors(DEFAULTS[gender]); setSpriteOpts(SPRITE_OPTIONS_DEFAULT[gender]) }}
              className="w-full py-2.5 rounded-xl text-[11px] text-white/20 hover:text-white/40 transition-all"
              style={{ fontFamily: "'JetBrains Mono', monospace", background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
              reset to defaults
            </button>

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
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 overflow-hidden" />
        <div className="w-6 h-6 rounded-md border border-white/10 flex-shrink-0" style={{ background: value }} />
      </div>
    </div>
  )
}