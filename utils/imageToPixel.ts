export interface ConversionOptions {
  targetWidth: number
  targetHeight: number
  numColors: number
  dithering: boolean
}

export interface ConversionResult {
  grid: (string | null)[]
  palette: string[]
  width: number
  height: number
  dataUrl: string
}

function colorDist(a: number[], b: number[]): number {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`
}

function kMeansQuantize(pixels: number[][], k: number, maxIter = 12): number[][] {
  if (pixels.length === 0) return []

  const centroids: number[][] = [pixels[Math.floor(Math.random() * pixels.length)].slice()]

  while (centroids.length < k) {
    const dists = pixels.map(p => Math.min(...centroids.map(c => colorDist(p, c))))
    const total = dists.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < dists.length; i++) {
      r -= dists[i]
      if (r <= 0) { centroids.push(pixels[i].slice()); break }
    }
    if (centroids.length < k) centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice())
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters: number[][][] = Array.from({ length: k }, () => [])

    for (const p of pixels) {
      let minDist = Infinity, minIdx = 0
      for (let i = 0; i < k; i++) {
        const d = colorDist(p, centroids[i])
        if (d < minDist) { minDist = d; minIdx = i }
      }
      clusters[minIdx].push(p)
    }

    let changed = false
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue
      const nr = clusters[i].reduce((s, p) => s + p[0], 0) / clusters[i].length
      const ng = clusters[i].reduce((s, p) => s + p[1], 0) / clusters[i].length
      const nb = clusters[i].reduce((s, p) => s + p[2], 0) / clusters[i].length
      if (Math.abs(centroids[i][0] - nr) + Math.abs(centroids[i][1] - ng) + Math.abs(centroids[i][2] - nb) > 0.5) {
        centroids[i] = [nr, ng, nb]; changed = true
      }
    }
    if (!changed) break
  }

  return centroids
}

function nearestColor(r: number, g: number, b: number, palette: number[][]): number {
  let minDist = Infinity, minIdx = 0
  for (let i = 0; i < palette.length; i++) {
    const d = colorDist([r, g, b], palette[i])
    if (d < minDist) { minDist = d; minIdx = i }
  }
  return minIdx
}

//Floyd-Steinberg 
function applyDithering(
  data: Float32Array,
  width: number,
  height: number,
  palette: number[][]
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height * 4)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const or = data[i], og = data[i + 1], ob = data[i + 2]
      const idx = nearestColor(or, og, ob, palette)
      const [nr, ng, nb] = palette[idx]

      out[i] = nr; out[i + 1] = ng; out[i + 2] = nb; out[i + 3] = 255

      const er = or - nr, eg = og - ng, eb = ob - nb

      // distribute error to neighbours
      const spread: [number, number, number][] = [
        [x + 1, y, 7 / 16], [x - 1, y + 1, 3 / 16],
        [x, y + 1, 5 / 16], [x + 1, y + 1, 1 / 16],
      ]

      for (const [nx, ny, factor] of spread) {
        if (nx < 0 || nx >= width || ny >= height) continue
        const ni = (ny * width + nx) * 4
        data[ni] += er * factor
        data[ni + 1] += eg * factor
        data[ni + 2] += eb * factor
      }
    }
  }

  return out
}

export async function convertImageToPixelArt(
  file: File,
  options: ConversionOptions
): Promise<ConversionResult> {
  const { targetWidth, targetHeight, numColors, dithering } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const offscreen = document.createElement('canvas')
        offscreen.width = targetWidth
        offscreen.height = targetHeight
        const ctx = offscreen.getContext('2d')!
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
        const raw = imageData.data

        const total = targetWidth * targetHeight
        const sampleSize = Math.min(total, 2000)
        const step = Math.max(1, Math.floor(total / sampleSize))
        const samples: number[][] = []
        for (let i = 0; i < total; i += step) {
          const j = i * 4
          samples.push([raw[j], raw[j + 1], raw[j + 2]])
        }

        //k-means quantize
        const k = Math.min(numColors, samples.length)
        const palette = kMeansQuantize(samples, k)

        let finalData: Uint8ClampedArray

        if (dithering) {
          const floatData = new Float32Array(raw.length)
          for (let i = 0; i < raw.length; i++) floatData[i] = raw[i]
          finalData = applyDithering(floatData, targetWidth, targetHeight, palette)
        } else {
          finalData = new Uint8ClampedArray(raw.length)
          for (let i = 0; i < total; i++) {
            const j = i * 4
            const idx = nearestColor(raw[j], raw[j + 1], raw[j + 2], palette)
            const [r, g, b] = palette[idx]
            finalData[j] = r; finalData[j + 1] = g; finalData[j + 2] = b; finalData[j + 3] = 255
          }
        }

        const grid: (string | null)[] = []
        const usedColors = new Set<string>()

        for (let i = 0; i < total; i++) {
          const j = i * 4
          const hex = toHex(finalData[j], finalData[j + 1], finalData[j + 2])
          grid.push(hex)
          usedColors.add(hex)
        }

        const out = document.createElement('canvas')
        out.width = targetWidth; out.height = targetHeight
        const outCtx = out.getContext('2d')!
        const outData = outCtx.createImageData(targetWidth, targetHeight)
        for (let i = 0; i < finalData.length; i++) outData.data[i] = finalData[i]
        outCtx.putImageData(outData, 0, 0)

        const hexPalette = palette.map(([r, g, b]) => toHex(r, g, b))
          .filter(h => usedColors.has(h))

        resolve({
          grid,
          palette: hexPalette,
          width: targetWidth,
          height: targetHeight,
          dataUrl: out.toDataURL('image/png'),
        })
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}