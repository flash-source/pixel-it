import { create } from 'zustand'

export type Tool = 'pencil' | 'eraser' | 'fill' | 'eyedropper'

interface EditorStore {
  tool: Tool
  color: string
  canvasWidth: number
  canvasHeight: number
  scale: number
  showGrid: boolean
  projectName: string
  projectId: string | null
  isDirty: boolean

  setTool: (t: Tool) => void
  setColor: (c: string) => void
  zoomIn: () => void
  zoomOut: () => void
  toggleGrid: () => void
  setCanvasSize: (w: number, h: number) => void
  setProjectName: (n: string) => void
  setProjectId: (id: string | null) => void
  setDirty: (d: boolean) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  tool: 'pencil',
  color: '#6c63ff',
  canvasWidth: 32,
  canvasHeight: 32,
  scale: 14,
  showGrid: true,
  projectName: 'untitled',
  projectId: null,
  isDirty: false,

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  zoomIn: () => set((s) => ({ scale: Math.min(32, s.scale + 2) })),
  zoomOut: () => set((s) => ({ scale: Math.max(4, s.scale - 2) })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setCanvasSize: (canvasWidth, canvasHeight) => set({ canvasWidth, canvasHeight }),
  setProjectName: (n) => set({ projectName: n }),
  setProjectId: (id) => set({ projectId: id }),
  setDirty: (isDirty) => set({ isDirty }),
}))