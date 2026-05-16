'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export type CanvasRef = {
  exportPNG: () => void
  clearGrid: () => void
  loadGrid: (data: { width: number; height: number; grid: (string | null)[] }) => void
  getGrid: () => { width: number; height: number; grid: (string | null)[] }
  getThumbnail: () => string
  undo: () => void
  redo: () => void
}

interface Props {
  width?: number
  height?: number
  scale?: number
  currentColor?: string
  tool?: string
  showGrid?: boolean
  initialGrid?: (string | null)[] | null   
  onEyedrop?: (color: string) => void
  onDirty?: () => void
}

const MAX_HISTORY = 50

const CanvasBoard = forwardRef<CanvasRef, Props>(function CanvasBoard({
  width = 32, height = 32, scale = 14,
  currentColor = '#6c63ff', tool = 'pencil',
  showGrid = true, initialGrid = null,
  onEyedrop, onDirty,
}, ref) {

  const initGrid = (): (string | null)[] => {
    if (initialGrid && initialGrid.length === width * height) return initialGrid.slice()
    if (typeof window === 'undefined') return new Array(width * height).fill(null)
    try {
      const saved = localStorage.getItem('pixelit_canvas_v2')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.width === width && p.height === height) return p.grid
      }
    } catch { /* ignore */ }
    return new Array(width * height).fill(null)
  }

  const [grid, setGrid] = useState<(string | null)[]>(initGrid)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef({ isDown: false, started: false })
  const lastPosRef = useRef<[number, number] | null>(null)
  const pastRef = useRef<(string | null)[][]>([])
  const futureRef = useRef<(string | null)[][]>([])

  useImperativeHandle(ref, () => ({
    exportPNG, clearGrid, getThumbnail,
    undo: applyUndo, redo: applyRedo,
    loadGrid: ({ width: w, height: h, grid: g }) => {
      if (w === width && h === height) setGrid(g.slice())
    },
    getGrid: () => ({ width, height, grid }),
  }))

  useEffect(() => { drawCanvas() }, [grid, scale, showGrid, width, height])

  useEffect(() => {
    const id = setTimeout(() => {
      if (typeof window === 'undefined') return
      try {
        localStorage.setItem('pixelit_canvas_v2', JSON.stringify({ width, height, grid }))
      } catch { /* ignore */ }
    }, 600)
    return () => clearTimeout(id)
  }, [grid, width, height])

  function drawCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const bw = width * scale, bh = height * scale
    canvas.width = bw; canvas.height = bh
    canvas.style.width = bw + 'px'; canvas.style.height = bh + 'px'
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = '#111118'; ctx.fillRect(0, 0, bw, bh)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const c = grid[y * width + x]
        if (c) { ctx.fillStyle = c; ctx.fillRect(x * scale, y * scale, scale, scale) }
      }
    }
    if (showGrid && scale >= 6) {
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1
      for (let x = 0; x <= width; x++) {
        ctx.beginPath(); ctx.moveTo(x * scale + 0.5, 0); ctx.lineTo(x * scale + 0.5, bh); ctx.stroke()
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * scale + 0.5); ctx.lineTo(bw, y * scale + 0.5); ctx.stroke()
      }
    }
  }

  function pointerToCell(e: React.PointerEvent): [number, number] {
    const canvas = canvasRef.current
    if (!canvas) return [-1, -1]
    const rect = canvas.getBoundingClientRect()
    return [
      Math.floor(((e.clientX - rect.left) / rect.width) * width),
      Math.floor(((e.clientY - rect.top) / rect.height) * height),
    ]
  }

  function pushHistory(snapshot: (string | null)[]) {
    pastRef.current.push(snapshot)
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift()
    futureRef.current = []
  }

  function applyUndo() {
    if (!pastRef.current.length) return
    const last = pastRef.current.pop()!
    setGrid(prev => { futureRef.current.push(prev.slice()); return last })
  }

  function applyRedo() {
    if (!futureRef.current.length) return
    const next = futureRef.current.pop()!
    setGrid(prev => { pastRef.current.push(prev.slice()); return next })
  }

  function applyStroke(x: number, y: number, color: string | null) {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    if (!drawingRef.current.started) {
      setGrid(prev => { pushHistory(prev.slice()); return prev })
      drawingRef.current.started = true
    }
    const idx = y * width + x
    setGrid(prev => {
      if (prev[idx] === color) return prev
      const c = prev.slice(); c[idx] = color; return c
    })
    onDirty?.()
  }

  function floodFill(x: number, y: number, replacement: string) {
    const startColor = grid[y * width + x] ?? null
    if (startColor === replacement) return
    const ng = grid.slice()
    const stack: [number, number][] = [[x, y]]
    while (stack.length) {
      const [cx, cy] = stack.pop()!
      if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
      if (ng[cy * width + cx] !== startColor) continue
      ng[cy * width + cx] = replacement
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
    }
    pushHistory(grid.slice()); setGrid(ng); onDirty?.()
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    drawingRef.current = { isDown: true, started: false }
    const [x, y] = pointerToCell(e)
    lastPosRef.current = [x, y]
    if (tool === 'eraser') applyStroke(x, y, null)
    else if (tool === 'fill') floodFill(x, y, currentColor)
    else if (tool === 'eyedropper') { const c = grid[y * width + x]; if (c) onEyedrop?.(c) }
    else applyStroke(x, y, currentColor)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drawingRef.current.isDown) return
    const [x, y] = pointerToCell(e)
    const last = lastPosRef.current
    if (last && last[0] === x && last[1] === y) return
    lastPosRef.current = [x, y]
    if (tool === 'eraser') applyStroke(x, y, null)
    else if (tool === 'pencil') applyStroke(x, y, currentColor)
  }

  function handlePointerUp() {
    drawingRef.current = { isDown: false, started: false }
    lastPosRef.current = null
  }

  function exportPNG() {
    canvasRef.current?.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'pixelit.png'; a.click()
      URL.revokeObjectURL(url)
    })
  }

  function getThumbnail(): string {
    const t = document.createElement('canvas')
    t.width = width; t.height = height
    const ctx = t.getContext('2d')!
    ctx.fillStyle = '#111118'; ctx.fillRect(0, 0, width, height)
    grid.forEach((c, i) => {
      if (!c) return; ctx.fillStyle = c
      ctx.fillRect(i % width, Math.floor(i / width), 1, 1)
    })
    return t.toDataURL('image/png')
  }

  function clearGrid() {
    pushHistory(grid.slice())
    setGrid(new Array(width * height).fill(null))
    onDirty?.()
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full overflow-auto"
      style={{ background: '#0a0a12' }}
    >
      <canvas
        ref={canvasRef}
        style={{ imageRendering: 'pixelated', cursor: 'crosshair', touchAction: 'none', borderRadius: 2 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
})

export default CanvasBoard