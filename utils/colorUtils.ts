export function generateShades(baseHex: string, count = 8): string[] {
  const r = parseInt(baseHex.slice(1, 3), 16)
  const g = parseInt(baseHex.slice(3, 5), 16)
  const b = parseInt(baseHex.slice(5, 7), 16)

  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    let nr: number, ng: number, nb: number

    if (t < 0.5) {
      const f = 0.15 + t * 1.7
      nr = Math.round(r * f)
      ng = Math.round(g * f)
      nb = Math.round(b * f)
    } else {
      const f = (t - 0.5) * 2
      nr = Math.round(r + (255 - r) * f * 0.65)
      ng = Math.round(g + (255 - g) * f * 0.65)
      nb = Math.round(b + (255 - b) * f * 0.65)
    }

    const clamp = (v: number) => Math.min(255, Math.max(0, v))
    return `#${clamp(nr).toString(16).padStart(2, '0')}${clamp(ng).toString(16).padStart(2, '0')}${clamp(nb).toString(16).padStart(2, '0')}`
  })
}