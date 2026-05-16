'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { generateShades } from '@/utils/colorUtils'

const BASE_COLORS = [
  '#f8f8f0', '#2d2d3d', '#ff6b6b', '#ff9f1c',
  '#ffd166', '#2ecc71', '#4dd0e1', '#6c63ff',
  '#9b8cff', '#ff6fb5', '#c0392b', '#1a1a2e',
]

export default function RightPanel() {
  const { color, setColor, canvasWidth, canvasHeight, setCanvasSize, scale } = useEditorStore()

  const [pinnedBase, setPinnedBase] = useState<string | null>(null)
  const [shades, setShades] = useState<string[]>([])

  const handleBaseClick = (base: string) => {
    setColor(base)
    if (pinnedBase === base) {
      setPinnedBase(null)
      setShades([])
    } else {
      setPinnedBase(base)
      setShades(generateShades(base, 8))
    }
  }

  const handleShadeClick = (shade: string) => {
    setColor(shade)
  }

  return (
    <aside
      className="flex flex-col border-l border-white/[0.06] bg-[#0c0c14] overflow-y-auto"
      style={{ width: 200, minHeight: 0 }}
    >
      <div className="p-4 border-b border-white/[0.06]">
        <Label>color</Label>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
            style={{ background: color }}
          />
          <div className="flex-1 min-w-0">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-7 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <p
              className="text-[9px] text-white/25 mt-0.5 truncate"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {color.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/[0.06]">
        <Label>palette <span className="text-white/15 normal-case">(click to pin shades)</span></Label>

        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {BASE_COLORS.map((base) => (
            <button
              key={base}
              onClick={() => handleBaseClick(base)}
              className="w-full aspect-square rounded-md transition-all"
              style={{
                background: base,
                outline: (color === base || pinnedBase === base)
                  ? '2px solid rgba(108,99,255,0.85)'
                  : color.toLowerCase() === base.toLowerCase()
                  ? '2px solid rgba(255,255,255,0.5)'
                  : 'none',
                outlineOffset: 1,
                transform: pinnedBase === base ? 'scale(1.12)' : 'scale(1)',
              }}
              title={base}
            />
          ))}
        </div>

        {pinnedBase && shades.length > 0 && (
          <div
            className="mt-3 p-2 rounded-xl flex flex-col gap-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p className="text-[9px] text-white/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              shades of {pinnedBase}
            </p>
            <div className="flex gap-1">
              {shades.map((s) => (
                <button
                  key={s}
                  onClick={() => handleShadeClick(s)}
                  className="flex-1 rounded transition-all"
                  style={{
                    background: s,
                    height: 20,
                    outline: color === s ? '2px solid rgba(108,99,255,0.85)' : 'none',
                    outlineOffset: 1,
                    transform: color === s ? 'scaleY(1.2)' : 'scaleY(1)',
                  }}
                  title={s}
                />
              ))}
            </div>
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
        <p
          className="text-[9px] text-white/20 mt-1.5"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          scale: {scale}px/cell
        </p>
      </div>

      <div className="p-4">
        <Label>shortcuts</Label>
        <div className="mt-2 flex flex-col gap-1.5">
          {shortcuts.map(([key, action]) => (
            <div key={key} className="flex items-center justify-between">
              <span
                className="text-[9px] text-white/20"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {action}
              </span>
              <kbd
                className="text-[8px] text-white/35 px-1.5 py-0.5 rounded"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[9px] text-white/25 uppercase tracking-widest"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {children}
    </p>
  )
}

function SizeInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      min={4}
      max={256}
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
  ['G', 'grid'],
]