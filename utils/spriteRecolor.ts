export type ColorMap = {
  skin: string
  hair: string
  clothes: string
}

export type AvatarSpec = {
  gender: 'male' | 'female'
  hairStyle: number
  accessory: 'none' | 'glasses' | 'headphones' | 'hat'
  beard: boolean
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r)      h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else                h = (r - g) / d + 4
  return [h * 60, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hk = h / 360
  const t = [hk + 1/3, hk, hk - 1/3]
  const rgb = t.map(tk => {
    if (tk < 0) tk += 1; if (tk > 1) tk -= 1
    if (tk < 1/6) return p + (q - p) * 6 * tk
    if (tk < 1/2) return q
    if (tk < 2/3) return p + (q - p) * (2/3 - tk) * 6
    return p
  })
  return [Math.round(rgb[0] * 255), Math.round(rgb[1] * 255), Math.round(rgb[2] * 255)]
}

const BASE = {
  skin:    rgbToHsl(...hexToRgb('#b59c7a')), 
  hair:    rgbToHsl(...hexToRgb('#573a28')),   
  beard:   rgbToHsl(...hexToRgb('#4e3629')),   
  clothes: rgbToHsl(...hexToRgb('#3f3f41')),   
  jeans:   rgbToHsl(...hexToRgb('#4b5c7c')),   
}

type Zone = 'skin' | 'hair' | 'clothes' | 'jeans' | null

function detectZone(r: number, g: number, b: number): Zone {
  const [h, s, l] = rgbToHsl(r, g, b)

  if (l < 0.12) return null

  if (l > 0.92) return null

  if (h >= 15 && h <= 55 && s >= 0.18 && l >= 0.45 && l <= 0.92) return 'skin'

  if (h >= 10 && h <= 45 && s >= 0.15 && l >= 0.12 && l < 0.48) return 'hair'

  if (h >= 190 && h <= 250 && s >= 0.15 && l >= 0.25 && l <= 0.60) return 'jeans'

  if (l >= 0.12 && l < 0.40 && s < 0.25) return 'clothes'

  return null
}

function recolorPixel(
  r: number, g: number, b: number,
  zone: Zone,
  colorMap: ColorMap
): [number, number, number] {
  if (!zone) return [r, g, b]

  const [ph, ps, pl] = rgbToHsl(r, g, b)

  let targetHex: string
  let baseHsl: [number, number, number]

  if (zone === 'skin') {
    targetHex = colorMap.skin
    baseHsl = BASE.skin
  } else if (zone === 'hair') {
    targetHex = colorMap.hair
    baseHsl = BASE.hair
  } else if (zone === 'jeans') {
    const [cr, cg, cb] = hexToRgb(colorMap.clothes)
    targetHex = `#${Math.min(255,cr+30).toString(16).padStart(2,'0')}${Math.min(255,cg+40).toString(16).padStart(2,'0')}${Math.min(255,cb+70).toString(16).padStart(2,'0')}`
    baseHsl = BASE.jeans
  } else {
    targetHex = colorMap.clothes
    baseHsl = BASE.clothes
  }

  const [th, ts, tl] = rgbToHsl(...hexToRgb(targetHex))
  const [bh, bs, bl] = baseHsl

  const lDelta = pl - bl
  const newL = Math.max(0.05, Math.min(0.97, tl + lDelta * 0.9))

  const sRatio = bs > 0 ? ts / bs : 1
  const newS = Math.max(0, Math.min(1, ps * sRatio * 1.1))

  const [nr, ng, nb] = hslToRgb(th, newS, newL)
  return [
    Math.max(0, Math.min(255, nr)),
    Math.max(0, Math.min(255, ng)),
    Math.max(0, Math.min(255, nb)),
  ]
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = `${src}?t=${Date.now()}`
  })
}

export async function compositeAvatar(
  canvas: HTMLCanvasElement,
  layers: string[],
  colorMap: ColorMap,
  bgColor: string,
  displaySize: number
): Promise<void> {
  canvas.width = displaySize
  canvas.height = displaySize
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, displaySize, displaySize)

  const off = document.createElement('canvas')
  off.width = displaySize; off.height = displaySize
  const offCtx = off.getContext('2d')!

  for (const src of layers) {
    if (!src) continue
    try {
      const img = await loadImage(src)
      offCtx.clearRect(0, 0, displaySize, displaySize)
      offCtx.imageSmoothingEnabled = false
      offCtx.drawImage(img, 0, 0, displaySize, displaySize)

      const imageData = offCtx.getImageData(0, 0, displaySize, displaySize)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 30) continue
        const zone = detectZone(data[i], data[i+1], data[i+2])
        if (zone) {
          const [nr, ng, nb] = recolorPixel(data[i], data[i+1], data[i+2], zone, colorMap)
          data[i] = nr; data[i+1] = ng; data[i+2] = nb
        }
      }

      offCtx.putImageData(imageData, 0, 0)
      ctx.drawImage(off, 0, 0)
    } catch { /* skip missing layer */ }
  }
}

const MALE_HAIR   = ['hair-short', 'hair-medium', 'hair-swept']
const FEMALE_HAIR = ['hair-bob', 'hair-long']

export function buildLayers(spec: AvatarSpec): string[] {
  const base = `/avatars/${spec.gender}`
  const hairFiles = spec.gender === 'male' ? MALE_HAIR : FEMALE_HAIR
  const hair = hairFiles[Math.min(spec.hairStyle, hairFiles.length - 1)]

  const layers: string[] = [
    `${base}/body.png`,
    `${base}/face.png`,
    `${base}/${hair}.png`,
  ]

  if (spec.beard && spec.gender === 'male') layers.push(`${base}/beard.png`)
  if (spec.accessory !== 'none') layers.push(`${base}/${spec.accessory}.png`)

  return layers
}