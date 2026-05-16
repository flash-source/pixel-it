export type AvatarOptions = {
  skinColor: string
  hairColor: string
  clothesColor: string
  bgColor: string
  hairStyle: number      
  accessory: string      
  beard: boolean
  eyeColor: string
}

export const DEFAULT_OPTIONS: AvatarOptions = {
  skinColor: '#f5c5a3',
  hairColor: '#3a2510',
  clothesColor: '#2d2d4a',
  bgColor: '#111118',
  hairStyle: 0,
  accessory: 'none',
  beard: false,
  eyeColor: '#4a3f99',
}

function r(y: number, x1: number, x2: number): [number, number][] {
  const out: [number, number][] = []
  for (let x = x1; x <= x2; x++) out.push([x, y])
  return out
}

function px(...pairs: [number, number][]): [number, number][] { return pairs }

const HEAD: [number, number][] = [
  ...r(5, 12, 19),
  ...r(6, 10, 21),
  ...r(7, 9, 22),
  ...r(8, 8, 23),  ...r(9, 8, 23),  ...r(10, 8, 23),
  ...r(11, 8, 23), ...r(12, 8, 23), ...r(13, 8, 23),
  ...r(14, 8, 23), ...r(15, 8, 23), ...r(16, 8, 23),
  ...r(17, 9, 22),
  ...r(18, 10, 21),
  ...r(19, 12, 19),
]

const EYE_LEFT_WHITE: [number, number][] = [...r(10, 10, 13), ...r(11, 10, 13), ...r(12, 10, 13)]
const EYE_RIGHT_WHITE: [number, number][] = [...r(10, 18, 21), ...r(11, 18, 21), ...r(12, 18, 21)]
const EYE_LEFT_PUPIL: [number, number][] = [...r(10, 11, 12), ...r(11, 11, 12)]
const EYE_RIGHT_PUPIL: [number, number][] = [...r(10, 19, 20), ...r(11, 19, 20)]

const EYEBROW_LEFT: [number, number][] = [...r(8, 10, 13)]
const EYEBROW_RIGHT: [number, number][] = [...r(8, 18, 21)]

const NOSE: [number, number][] = [
  ...px([15, 14], [14, 15], [16, 15])
]

const MOUTH: [number, number][] = [
  ...r(17, 12, 19),
  ...r(18, 13, 18),
]

const NECK: [number, number][] = [
  ...r(20, 13, 18),
  ...r(21, 13, 18),
]

const BODY: [number, number][] = [
  ...r(22, 11, 20),
  ...r(23, 9, 22),
  ...r(24, 7, 24),
  ...r(25, 5, 26),
  ...r(26, 4, 27),
  ...r(27, 3, 28),
  ...r(28, 2, 29),
  ...r(29, 1, 30),
  ...r(30, 0, 31),
  ...r(31, 0, 31),
]

const COLLAR: [number, number][] = [
  ...px([22, 14], [22, 15], [22, 16], [22, 17]),
  ...px([23, 13], [23, 14], [23, 15], [23, 16], [23, 17], [23, 18]),
  ...px([24, 12], [24, 13], [24, 14]),
]

const HAIR_STYLES: [number, number][][] = [
  [
    ...r(3, 12, 19),
    ...r(4, 10, 21),
    ...r(5, 8, 23),
    ...px([6, 8], [7, 8], [8, 8], [9, 8]),
    ...px([6, 23], [7, 23], [8, 23], [9, 23]),
  ],
  [
    ...r(2, 11, 20),
    ...r(3, 9, 22),
    ...r(4, 8, 23),
    ...r(5, 7, 24),
    ...px([6, 7], [7, 7], [8, 7], [9, 7], [10, 7]),
    ...px([6, 23], [7, 23], [8, 23], [9, 23], [10, 23]),
    ...px([11, 8], [12, 8]),
    ...px([20, 8], [21, 8]),
  ],
  [
    ...r(1, 10, 21),
    ...r(2, 8, 23),
    ...r(3, 7, 24),
    ...r(4, 6, 25),
    ...r(5, 6, 7),  ...r(5, 24, 25),
    ...r(6, 6, 7),  ...r(6, 24, 25),
    ...r(7, 6, 7),  ...r(7, 24, 25),
    ...r(8, 6, 7),  ...r(8, 24, 25),
    ...r(9, 6, 7),  ...r(9, 24, 25),
    ...r(10, 6, 7), ...r(10, 24, 25),
    ...r(11, 6, 7), ...r(11, 24, 25),
    ...r(12, 6, 7), ...r(12, 24, 25),
    ...r(13, 6, 7), ...r(13, 24, 25),
  ],
]

const HEADPHONES_BAND: [number, number][] = [
  ...r(1, 12, 19),
  ...px([2, 11], [2, 20], [3, 10], [3, 21]),
]
const HEADPHONES_LEFT: [number, number][] = [
  ...r(5, 5, 8), ...r(6, 5, 8), ...r(7, 5, 8),
  ...r(8, 5, 8), ...r(9, 5, 8),
]
const HEADPHONES_RIGHT: [number, number][] = [
  ...r(5, 23, 26), ...r(6, 23, 26), ...r(7, 23, 26),
  ...r(8, 23, 26), ...r(9, 23, 26),
]

const GLASSES_LEFT: [number, number][] = [
  ...r(9, 9, 14), ...r(10, 9, 14), ...r(11, 9, 14), ...r(12, 9, 14),
  ...px([9, 9], [9, 14], [12, 9], [12, 14]),  // corners
]
const GLASSES_RIGHT: [number, number][] = [
  ...r(9, 17, 22), ...r(10, 17, 22), ...r(11, 17, 22), ...r(12, 17, 22),
]
const GLASSES_BRIDGE: [number, number][] = [...r(10, 15, 16), ...r(11, 15, 16)]
const GLASSES_ARM_L: [number, number][] = [...px([9, 8], [10, 7], [11, 7])]
const GLASSES_ARM_R: [number, number][] = [...px([9, 23], [10, 24], [11, 24])]

const HAT_BRIM: [number, number][] = [...r(4, 6, 25)]
const HAT_BODY: [number, number][] = [
  ...r(1, 10, 21),
  ...r(2, 9, 22),
  ...r(3, 9, 22),
]

const BEARD: [number, number][] = [
  ...r(16, 11, 20),
  ...r(17, 10, 21),
  ...r(18, 10, 21),
  ...r(19, 11, 20),
]

export const CELL = 8  

export function drawAvatar(canvas: HTMLCanvasElement, opts: AvatarOptions) {
  const ctx = canvas.getContext('2d')!

  const SIZE = 32
  canvas.width = SIZE * CELL
  canvas.height = SIZE * CELL
  ctx.imageSmoothingEnabled = false

  function fill(pixels: [number, number][], color: string) {
    ctx.fillStyle = color
    for (const [x, y] of pixels) {
      if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) continue
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL)
    }
  }

  function darken(hex: string, amount = 30): string {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  function lighten(hex: string, amount = 30): string {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  ctx.fillStyle = opts.bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  fill(BODY, opts.clothesColor)
  fill(COLLAR, darken(opts.clothesColor, 20))

  fill(NECK, opts.skinColor)

  fill(HEAD, opts.skinColor)

  const hair = HAIR_STYLES[Math.min(opts.hairStyle, HAIR_STYLES.length - 1)]
  fill(hair, opts.hairColor)
  
  fill(hair.slice(0, 4), lighten(opts.hairColor, 15))

  fill(EYEBROW_LEFT, darken(opts.hairColor, 10))
  fill(EYEBROW_RIGHT, darken(opts.hairColor, 10))

  fill(EYE_LEFT_WHITE, '#e8e8f0')
  fill(EYE_RIGHT_WHITE, '#e8e8f0')
  fill(EYE_LEFT_PUPIL, opts.eyeColor)
  fill(EYE_RIGHT_PUPIL, opts.eyeColor)
 
  fill(px([10, 11], [10, 19]), '#ffffff')

  fill(NOSE, darken(opts.skinColor, 25))

  fill(MOUTH.slice(0, MOUTH.length / 2), darken(opts.skinColor, 35))
  fill(MOUTH.slice(MOUTH.length / 2), '#c0726a')

  if (opts.beard) {
    fill(BEARD, darken(opts.hairColor, 5))
  }

  if (opts.accessory === 'headphones') {
    fill(HEADPHONES_BAND, '#888')
    fill(HEADPHONES_LEFT, '#333')
    fill(HEADPHONES_RIGHT, '#333')
   
    fill(px([7, 6], [7, 7], [7, 8]), '#555')
    fill(px([7, 24], [7, 25], [7, 26]), '#555')
  } else if (opts.accessory === 'glasses') {
   
    fill(GLASSES_LEFT, 'transparent')
    ctx.strokeStyle = '#888'
    ctx.lineWidth = CELL
    fill(GLASSES_LEFT.filter((_, i) => i % 5 === 0), '#aaa')
    fill(GLASSES_RIGHT.filter((_, i) => i % 5 === 0), '#aaa')
   
    const glassOutlineL: [number, number][] = [
      ...r(9, 9, 14), ...r(12, 9, 14),
      ...px([10, 9], [11, 9], [10, 14], [11, 14])
    ]
    const glassOutlineR: [number, number][] = [
      ...r(9, 17, 22), ...r(12, 17, 22),
      ...px([10, 17], [11, 17], [10, 22], [11, 22])
    ]
    fill(glassOutlineL, '#c0c0c0')
    fill(glassOutlineR, '#c0c0c0')
    fill(GLASSES_BRIDGE, '#c0c0c0')
    fill(GLASSES_ARM_L, '#c0c0c0')
    fill(GLASSES_ARM_R, '#c0c0c0')
    // tint
    const lensTintL = GLASSES_LEFT.filter(([x, y]) => x > 9 && x < 14 && y > 9 && y < 12)
    const lensTintR = GLASSES_RIGHT.filter(([x, y]) => x > 17 && x < 22 && y > 9 && y < 12)
    ctx.globalAlpha = 0.15
    fill(lensTintL, '#88aaff')
    fill(lensTintR, '#88aaff')
    ctx.globalAlpha = 1
  } else if (opts.accessory === 'hat') {
    fill(HAT_BODY, darken(opts.clothesColor, 10))
    fill(HAT_BRIM, darken(opts.clothesColor, 5))
    // band
    fill(r(4, 9, 22), lighten(opts.hairColor, 10))
  }
}

export async function sampleColorsFromImage(
  file: File
): Promise<{ skinColor: string; hairColor: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = 64; canvas.height = 64
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 64, 64)

      const skinData = ctx.getImageData(22, 24, 20, 20).data
      let sr = 0, sg = 0, sb = 0, sc = 0
      for (let i = 0; i < skinData.length; i += 4) {
        sr += skinData[i]; sg += skinData[i + 1]; sb += skinData[i + 2]; sc++
      }

      const hairData = ctx.getImageData(20, 2, 24, 14).data
      let hr = 0, hg = 0, hb = 0, hc = 0
      for (let i = 0; i < hairData.length; i += 4) {
        hr += hairData[i]; hg += hairData[i + 1]; hb += hairData[i + 2]; hc++
      }

      const toHex = (r: number, g: number, b: number) =>
        `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`

      resolve({
        skinColor: toHex(sr / sc, sg / sc, sb / sc),
        hairColor: toHex(hr / hc, hg / hc, hb / hc),
      })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ skinColor: '#f5c5a3', hairColor: '#3a2510' })
    }
    img.src = url
  })
}

export function avatarToGrid(canvas: HTMLCanvasElement): (string | null)[] {
  const SIZE = 32
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const grid: (string | null)[] = []

  for (let py = 0; py < SIZE; py++) {
    for (let px2 = 0; px2 < SIZE; px2++) {
      const ax = px2 * CELL + Math.floor(CELL / 2)
      const ay = py * CELL + Math.floor(CELL / 2)
      const i = (ay * canvas.width + ax) * 4
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      grid.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
    }
  }
  return grid
}