'use client'
import { create } from 'zustand'
import { Building, Floor, MapEdge, MapNode, NodeType, Tool } from '@/lib/routing/graph/types'
import { DEFAULT_BUILDING } from '@/lib/routing/graph/hotelExample'
import { saveBuilding, loadBuilding } from '@/lib/routing/storage/persist'

function genId() { return Math.random().toString(36).slice(2, 9) }

function getDefaultLabel(type: NodeType, count: number): string {
  const labels: Record<NodeType, string> = {
    room: `Room ${100 + count}`,
    corridor: `Corridor ${String.fromCharCode(65 + count)}`,
    stair: `Stairs`,
    elevator: `Elevator`,
    entry: `Entry`,
    exit: `Exit`,
    door: `Door ${count + 1}`,
  }
  return labels[type] ?? `Node ${count + 1}`
}

interface EditorState {
  building: Building
  activeFloorId: number
  activeTool: Tool
  selectedNodeId: string | null
  selectedEdgeId: string | null
  snapToGrid: boolean
  edgeStartNodeId: string | null
  hydrated: boolean

  initialize: () => Promise<void>
  setBuilding: (b: Building) => void
  resetToDefault: () => void

  addFloor: () => void
  deleteFloor: (id: number) => void
  renameFloor: (id: number, name: string) => void
  setActiveFloor: (id: number) => void

  addNode: (data: Omit<MapNode, 'id'>) => void
  updateNode: (id: string, updates: Partial<MapNode>) => void
  deleteNode: (id: string) => void

  addEdge: (data: Omit<MapEdge, 'id'>) => void
  updateEdge: (id: string, updates: Partial<MapEdge>) => void
  deleteEdge: (id: string) => void

  setTool: (tool: Tool) => void
  setSelectedNode: (id: string | null) => void
  setSelectedEdge: (id: string | null) => void
  setEdgeStartNode: (id: string | null) => void
  toggleSnapToGrid: () => void
}

function updateBuildingFloor(building: Building, floorId: number, updater: (f: Floor) => Floor): Building {
  return { ...building, floors: building.floors.map(f => f.id === floorId ? updater(f) : f) }
}

export const useRoutingEditorStore = create<EditorState>((set, get) => ({
  building: DEFAULT_BUILDING,
  activeFloorId: 1,
  activeTool: 'select',
  selectedNodeId: null,
  selectedEdgeId: null,
  snapToGrid: true,
  edgeStartNodeId: null,
  hydrated: false,

  initialize: async () => {
    const building = await loadBuilding()
    if (building) {
      set({ building, activeFloorId: building.floors[0]?.id ?? 1, hydrated: true })
    } else {
      set({ building: DEFAULT_BUILDING, activeFloorId: 1, hydrated: true })
      // Initial persist for first boot
      saveBuilding(DEFAULT_BUILDING)
    }
  },

  setBuilding: (b) => { set({ building: b, activeFloorId: b.floors[0]?.id ?? 1 }); saveBuilding(b) },
  resetToDefault: () => set({ building: DEFAULT_BUILDING, activeFloorId: 1, selectedNodeId: null, selectedEdgeId: null }),

  addFloor: () => {
    const { building } = get()
    const maxId = Math.max(0, ...building.floors.map(f => f.id))
    const newFloor: Floor = { id: maxId + 1, name: `Floor ${maxId + 1}`, nodes: [], edges: [] }
    const updated = { ...building, floors: [...building.floors, newFloor] }
    set({ building: updated, activeFloorId: newFloor.id })
    saveBuilding(updated)
  },

  deleteFloor: (id) => {
    const { building, activeFloorId } = get()
    if (building.floors.length <= 1) return
    const updated = {
      ...building,
      floors: building.floors.filter(f => f.id !== id),
      crossFloorEdges: building.crossFloorEdges.filter(e => {
        const nodes = building.floors.flatMap(f => f.nodes)
        const nm = new Map(nodes.map(n => [n.id, n]))
        return nm.get(e.from)?.floorId !== id && nm.get(e.to)?.floorId !== id
      }),
    }
    const newActive = activeFloorId === id ? updated.floors[0].id : activeFloorId
    set({ building: updated, activeFloorId: newActive })
    saveBuilding(updated)
  },

  renameFloor: (id, name) => {
    const updated = updateBuildingFloor(get().building, id, f => ({ ...f, name }))
    set({ building: updated }); saveBuilding(updated)
  },

  setActiveFloor: (id) => set({ activeFloorId: id, selectedNodeId: null, selectedEdgeId: null, edgeStartNodeId: null }),

  addNode: (data) => {
    const { building, activeFloorId } = get()
    const activeFloor = building.floors.find(f => f.id === activeFloorId)
    const count = activeFloor?.nodes.length ?? 0
    const node: MapNode = { ...data, id: genId(), label: data.label || getDefaultLabel(data.type, count) }
    const updated = updateBuildingFloor(building, activeFloorId, f => ({ ...f, nodes: [...f.nodes, node] }))
    set({ building: updated, selectedNodeId: node.id })
    saveBuilding(updated)
  },

  updateNode: (id, updates) => {
    const { building } = get()
    const updated = {
      ...building,
      floors: building.floors.map(f => ({
        ...f, nodes: f.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      })),
    }
    set({ building: updated }); saveBuilding(updated)
  },

  deleteNode: (id) => {
    const { building } = get()
    const updated = {
      ...building,
      floors: building.floors.map(f => ({
        ...f,
        nodes: f.nodes.filter(n => n.id !== id),
        edges: f.edges.filter(e => e.from !== id && e.to !== id),
      })),
      crossFloorEdges: building.crossFloorEdges.filter(e => e.from !== id && e.to !== id),
    }
    set({ building: updated, selectedNodeId: null }); saveBuilding(updated)
  },

  addEdge: (data) => {
    const { building, activeFloorId } = get()
    const edge: MapEdge = { ...data, id: genId() }
    const updated = updateBuildingFloor(building, activeFloorId, f => ({ ...f, edges: [...f.edges, edge] }))
    set({ building: updated }); saveBuilding(updated)
  },

  updateEdge: (id, updates) => {
    const { building } = get()
    const updated = {
      ...building,
      floors: building.floors.map(f => ({
        ...f, edges: f.edges.map(e => e.id === id ? { ...e, ...updates } : e),
      })),
    }
    set({ building: updated }); saveBuilding(updated)
  },

  deleteEdge: (id) => {
    const { building } = get()
    const updated = {
      ...building,
      floors: building.floors.map(f => ({ ...f, edges: f.edges.filter(e => e.id !== id) })),
    }
    set({ building: updated, selectedEdgeId: null }); saveBuilding(updated)
  },

  setTool: (tool) => set({ activeTool: tool, edgeStartNodeId: null, selectedNodeId: null, selectedEdgeId: null }),
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  setEdgeStartNode: (id) => set({ edgeStartNodeId: id }),
  toggleSnapToGrid: () => set(s => ({ snapToGrid: !s.snapToGrid })),
}))
