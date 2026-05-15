'use client'

import { useRef, useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateShades } from '@/utils/colorUtils'

const BASE_COLORS = [
  '#f8f8f0', '#2d2d3d', '#ff6b6b', '#ff9f1c',
  '#ffd166', '#2ecc71', '#4dd0e1', '#6c63ff',
  '#9b8cff', '#ff6fb5', '#c0392b', '#1a1a2e',
]

export default function RightPanel() {
  const { color, setColor, canvasWidth, canvasHeight, setCanvasSize, scale } = useEditorStore()
  const [hoverBase, setHoverBase] = useState<string | null>(null)
  const [shades, setShades] = useState<string[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openShades = (base: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHoverBase(base)
    setShades(generateShades(base, 7))
  }

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => { setHoverBase(null); setShades([]) }, 150)
  }

  return (
    <aside
      className="flex flex-col border-l border-white/[0.06] bg-[#0c0c14] overflow-y-auto"
      style={{ width: 200, minHeight: 0 }}
    >
      <div className="p-4 border-b border-white/[0.06]">
        <Label>color</Label>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0" style={{ background: color }} />
          <div className="flex-1">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent border-0 p-0"
              style={{ appearance: 'none' }}
            />
            <p className="text-[9px] text-white/25 mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {color.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/[0.06]">
        <Label>palette</Label>
        <div className="grid grid-cols-4 gap-1.5 mt-2 relative">
          {BASE_COLORS.map((base) => (
            <div key={base} className="relative"
              onMouseEnter={() => openShades(base)}
              onMouseLeave={scheduleClose}
            >
              <button
                onClick={() => setColor(base)}
                className="w-full aspect-square rounded-md transition-transform hover:scale-110"
                style={{
                  background: base,
                  outline: color === base ? '2px solid rgba(108,99,255,0.8)' : 'none',
                  outlineOffset: 1,
                }}
                title={base}
              />
            </div>
          ))}
        </div>

        {hoverBase && shades.length > 0 && (
          <div
            className="flex gap-1 mt-2 p-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current) }}
            onMouseLeave={scheduleClose}
          >
            {shades.map((s) => (
              <button
                key={s}
                onClick={() => { setColor(s); setHoverBase(null); setShades([]) }}
                className="flex-1 h-5 rounded transition-transform hover:scale-110"
                style={{ background: s, outline: color === s ? '1px solid rgba(108,99,255,0.8)' : 'none' }}
                title={s}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-b border-white/[0.06]">
        <Label>canvas size</Label>
        <div className="flex items-center gap-2 mt-2">
          <SizeInput
            value={canvasWidth}
            onChange={(v) => setCanvasSize(v, canvasHeight)}
          />
          <span className="text-white/20 text-[11px]">×</span>
          <SizeInput
            value={canvasHeight}
            onChange={(v) => setCanvasSize(canvasWidth, v)}
          />
        </div>
        <p className="text-[9px] text-white/20 mt-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          scale: {scale}px/cell
        </p>
      </div>

      <div className="p-4">
        <Label>shortcuts</Label>
        <div className="mt-2 flex flex-col gap-1.5">
          {shortcuts.map(([key, action]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-[9px] text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{action}</span>
              <kbd className="text-[8px] text-white/30 px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', fontFamily: "'JetBrains Mono', monospace" }}>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] text-white/25 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {children}
    </p>
  )
}

function SizeInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      min={4} max={256}
      onChange={(e) => onChange(Math.max(4, Math.min(256, Number(e.target.value) || 32)))}
      className="w-full text-center text-[11px] text-white/60 rounded-lg px-1 py-1.5 outline-none"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    />
  )
}

const shortcuts = [
  ['P', 'pencil'],
  ['E', 'eraser'],
  ['F', 'fill'],
  ['I', 'eyedropper'],
  ['Ctrl+Z', 'undo'],
  ['Ctrl+Y', 'redo'],
  ['+', 'zoom in'],
  ['-', 'zoom out'],
]