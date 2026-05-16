export type KeyColorMap = {
  skin: string
  hair: string
  clothes: string
  accessory?: string
}

const KEY_COLORS: Record<string, string> = {
  '#ff8866': 'skin',
  '#cc6644': 'skinShadow',
  '#885522': 'hair',
  '#663311': 'beard',
  '#334455': 'clothes',
  '#223344': 'clothesDark',
  '#777777': 'accessory',
  '#444444': 'accessoryDark',
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`
}

function colorDist([r1,g1,b1]: number[], [r2,g2,b2]: number[]): number {
  return (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2
}

function shadeHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(
    Math.max(0, Math.min(255, r + amount)),
    Math.max(0, Math.min(255, g + amount)),
    Math.max(0, Math.min(255, b + amount)),
  )
}

function buildColorTable(opts: KeyColorMap): Map<string, [number, number, number]> {
  const table = new Map<string, [number, number, number]>()
  const skinD = shadeHex(opts.skin, -35)
  const hairD = shadeHex(opts.hair, -25)
  const clothesD = shadeHex(opts.clothes, -35)
  const accColor = opts.accessory ?? '#666666'
  const accD = shadeHex(accColor, -40)

  table.set('#ff8866', hexToRgb(opts.skin))
  table.set('#cc6644', hexToRgb(skinD))
  table.set('#885522', hexToRgb(opts.hair))
  table.set('#663311', hexToRgb(hairD))
  table.set('#334455', hexToRgb(opts.clothes))
  table.set('#223344', hexToRgb(clothesD))
  table.set('#777777', hexToRgb(accColor))
  table.set('#444444', hexToRgb(accD))

  return table
}

const THRESHOLD = 900  

export async function renderSprite(
  canvas: HTMLCanvasElement,
  spritePaths: string[],         
  colorMap: KeyColorMap,
  bgColor: string,
  size: number                  
): Promise<void> {
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  const table = buildColorTable(colorMap)

  for (const path of spritePaths) {
    if (!path) continue
    try {
      await drawRecoloredLayer(ctx, path, table, size)
    } catch { /* skip */ }
  }
}

async function drawRecoloredLayer(
  ctx: CanvasRenderingContext2D,
  src: string,
  table: Map<string, [number, number, number]>,
  size: number
): Promise<void> {
  const img = await loadImage(src)
  // draw to offscreen to read pixels
  const off = document.createElement('canvas')
  off.width = img.naturalWidth || img.width
  off.height = img.naturalHeight || img.height
  const offCtx = off.getContext('2d')!
  offCtx.drawImage(img, 0, 0)

  const imageData = offCtx.getImageData(0, 0, off.width, off.height)
  const data = imageData.data

  const keyRgbs = Array.from(table.entries()).map(([hex, rgb]) => ({ hex, rgb }))

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 10) continue   // transparent — skip
    const pr: [number,number,number] = [data[i], data[i+1], data[i+2]]

    let best: { hex: string; rgb: [number,number,number] } | null = null
    let bestDist = THRESHOLD

    for (const { hex, rgb } of keyRgbs) {
      const d = colorDist(pr, rgb)
      if (d < bestDist) { bestDist = d; best = { hex, rgb } }
    }

    if (best) {
      const replacement = table.get(best.hex)!
      data[i] = replacement[0]
      data[i+1] = replacement[1]
      data[i+2] = replacement[2]
    }
  }

  offCtx.putImageData(imageData, 0, 0)

  // scale up to canvas size (nearest-neighbour)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(off, 0, 0, size, size)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export type SpriteOptions = {
  gender: 'male' | 'female'
  hairStyle: number      
  accessory: 'none' | 'glasses' | 'headphones' | 'hat'
  beard: boolean         
}

export function buildSpritePaths(opts: SpriteOptions): string[] {
  const base = `/avatars/${opts.gender}`
  const hairNames = opts.gender === 'male'
    ? ['hair-short', 'hair-medium', 'hair-swept']
    : ['hair-bob', 'hair-long']
  const hair = hairNames[Math.min(opts.hairStyle, hairNames.length - 1)]

  const layers: string[] = [
    `${base}/body.png`,                           
    `${base}/face.png`,                          
    `${base}/${hair}.png`,                         
  ]

  if (opts.beard && opts.gender === 'male') {
    layers.push(`${base}/beard.png`)
  }

  if (opts.accessory !== 'none') {
    layers.push(`${base}/${opts.accessory}.png`)
  }

  return layers
}