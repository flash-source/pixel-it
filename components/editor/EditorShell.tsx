'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CanvasBoard, { type CanvasRef } from './CanvasBoard'
import Toolbar from './Toolbar'
import RightPanel from './RightPanel'
import { useEditorStore } from '@/store/editorStore'

interface InitialData {
  id: string
  name: string
  canvasData: { width: number; height: number; grid: (string | null)[] }
}

interface ImportedGrid {
  width: number
  height: number
  grid: (string | null)[]
}

interface Props {
  initialData?: InitialData | null
}

function consumeImport(): ImportedGrid | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('pixelit_import')
    if (!raw) return null
    const data = JSON.parse(raw) as ImportedGrid
    localStorage.removeItem('pixelit_import')
    return data
  } catch {
    return null
  }
}

export default function EditorShell({ initialData }: Props) {
  const searchParams = useSearchParams()
  const isImport = searchParams.get('from') === 'import'

  const importedRef = useRef<ImportedGrid | null>(isImport ? consumeImport() : null)

  const canvasRef = useRef<CanvasRef>(null)
  const router = useRouter()

  const {
    tool, color, canvasWidth, canvasHeight, scale, showGrid,
    projectName, projectId, isDirty,
    setTool, setColor, setProjectName, setProjectId, setDirty,
    zoomIn, zoomOut, toggleGrid,
  } = useEditorStore()

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    if (initialData) {
      setProjectName(initialData.name)
      setProjectId(initialData.id)
    } else if (isImport && importedRef.current) {
      setProjectName('converted image')
      setProjectId(null)
      setDirty(true)
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const key = e.key.toLowerCase()
      if (key === 'p') setTool('pencil')
      else if (key === 'e') setTool('eraser')
      else if (key === 'f') setTool('fill')
      else if (key === 'i') setTool('eyedropper')
      else if (key === 'g') toggleGrid()
      else if (key === '=' || key === '+') { e.preventDefault(); zoomIn() }
      else if (key === '-') { e.preventDefault(); zoomOut() }
      else if ((e.ctrlKey || e.metaKey) && key === 'z') { e.preventDefault(); canvasRef.current?.undo() }
      else if ((e.ctrlKey || e.metaKey) && key === 'y') { e.preventDefault(); canvasRef.current?.redo() }
      else if ((e.ctrlKey || e.metaKey) && key === 's') { e.preventDefault(); handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [projectId, projectName])

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setSaving(true)
    setSaveMsg('')
    const { grid, width, height } = canvas.getGrid()
    const thumbnail = canvas.getThumbnail()
    try {
      const res = await fetch(projectId ? `/api/projects/${projectId}` : '/api/projects', {
        method: projectId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: projectName, type: 'manual', thumbnail, canvasData: { width, height, grid } }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!projectId) {
        setProjectId(data.id)
        router.replace(`/create?id=${data.id}`)
      }
      setDirty(false)
      setSaveMsg('saved')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch {
      setSaveMsg('error')
      setTimeout(() => setSaveMsg(''), 3000)
    } finally {
      setSaving(false)
    }
  }, [projectId, projectName])

  const initialGrid: (string | null)[] | null =
    importedRef.current?.grid ?? initialData?.canvasData?.grid ?? null

  const canvasW = importedRef.current?.width ?? initialData?.canvasData?.width ?? canvasWidth
  const canvasH = importedRef.current?.height ?? initialData?.canvasData?.height ?? canvasHeight

  return (
    <div className="flex flex-col bg-[#07070d] text-white" style={{ height: '100vh', overflow: 'hidden' }}>

      <header
        className="flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0c0c14] flex-shrink-0"
        style={{ height: 48 }}
      >
        <div className="flex items-center gap-3">
          <Link href="/">
            <span style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-[9px] text-[#6c63ff]">
              pixel<span className="text-white">.it</span>
            </span>
          </Link>
          <span className="text-white/10">|</span>
          <input
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); setDirty(true) }}
            className="bg-transparent text-[12px] text-white/60 outline-none hover:text-white/80 focus:text-white transition-colors w-36"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] opacity-70 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-2">
          {saveMsg && (
            <span
              className="text-[10px]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: saveMsg === 'saved' ? '#2ecc71' : '#ff6b6b',
              }}
            >
              {saveMsg === 'saved' ? '✓ saved' : '✕ error'}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[11px] px-4 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: 'rgba(108,99,255,0.2)',
              border: '1px solid rgba(108,99,255,0.35)',
              color: '#9b8cff',
            }}
          >
            {saving ? 'saving...' : 'save'}
          </button>
          <button
            onClick={() => canvasRef.current?.exportPNG()}
            className="text-[11px] px-4 py-1.5 rounded-lg font-medium transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: 'rgba(46,204,113,0.15)',
              border: '1px solid rgba(46,204,113,0.3)',
              color: '#2ecc71',
            }}
          >
            export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Toolbar
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          onClear={() => { if (confirm('Clear canvas?')) canvasRef.current?.clearGrid() }}
        />

        <main className="flex-1 overflow-hidden">
          <CanvasBoard
            ref={canvasRef}
            width={canvasW}
            height={canvasH}
            scale={scale}
            currentColor={color}
            tool={tool}
            showGrid={showGrid}
            initialGrid={initialGrid}
            onEyedrop={setColor}
            onDirty={() => setDirty(true)}
          />
        </main>

        <RightPanel />
      </div>
    </div>
  )
}