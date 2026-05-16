'use client'

import { useEditorStore, type Tool } from '@/store/editorStore'

const tools: { id: Tool; icon: string; title: string }[] = [
  { id: 'pencil',      icon: '✏️', title: 'Pencil (P)'      },
  { id: 'eraser',      icon: '⌫',  title: 'Eraser (E)'      },
  { id: 'fill',        icon: '🪣', title: 'Fill (F)'        },
  { id: 'eyedropper',  icon: '💉', title: 'Eyedropper (I)'  },
]

interface Props {
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
}

export default function Toolbar({ onUndo, onRedo, onClear }: Props) {
  const { tool, setTool, zoomIn, zoomOut, toggleGrid, showGrid } = useEditorStore()

  return (
    <aside
      className="flex flex-col items-center gap-1.5 px-2 py-3 border-r border-white/[0.06] bg-[#0c0c14]"
      style={{ width: 56 }}
    >
      {tools.map((t) => (
        <ToolBtn
          key={t.id}
          title={t.title}
          active={tool === t.id}
          onClick={() => setTool(t.id)}
        >
          {t.icon}
        </ToolBtn>
      ))}

      <Divider />

      <ToolBtn title="Undo (Ctrl+Z)" onClick={onUndo}>↩</ToolBtn>
      <ToolBtn title="Redo (Ctrl+Y)" onClick={onRedo}>↪</ToolBtn>

      <Divider />

      <ToolBtn title="Zoom In (+)" onClick={zoomIn}>＋</ToolBtn>
      <ToolBtn title="Zoom Out (-)" onClick={zoomOut}>－</ToolBtn>

      <Divider />

      <ToolBtn title="Toggle Grid (G)" active={showGrid} onClick={toggleGrid}>⊞</ToolBtn>

      <Divider />

      <ToolBtn title="Clear Canvas" onClick={onClear} danger>✕</ToolBtn>
    </aside>
  )
}

function ToolBtn({
  children, title, active = false, danger = false, onClick,
}: {
  children: React.ReactNode
  title: string
  active?: boolean
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-[15px] transition-all duration-150 select-none"
      style={{
        background: active ? 'rgba(108,99,255,0.28)' : 'rgba(255,255,255,0.06)',
        color: danger
          ? 'rgba(248,113,113,0.75)'
          : active
          ? '#c4bfff'
          : 'rgba(255,255,255,0.70)',          // ← bright even when inactive
        border: active
          ? '1px solid rgba(108,99,255,0.45)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: active ? '0 0 10px rgba(108,99,255,0.2)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.11)'
          ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.95)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
          ;(e.currentTarget as HTMLElement).style.color = danger ? 'rgba(248,113,113,0.75)' : 'rgba(255,255,255,0.70)'
        }
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-6 h-px bg-white/[0.07] my-0.5" />
}