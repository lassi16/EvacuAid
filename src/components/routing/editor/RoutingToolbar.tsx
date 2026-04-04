'use client'
import { Tool } from '@/lib/routing/graph/types'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'

type ToolDef = { tool: Tool; icon: string; label: string; tip: string }

const TOOLS: ToolDef[] = [
  { tool: 'select', icon: '↖️', label: 'Select', tip: 'Select & drag nodes' },
  { tool: 'pan', icon: '✋', label: 'Pan', tip: 'Pan the canvas' },
  { tool: 'draw-edge', icon: '🔗', label: 'Edge', tip: 'Click two nodes to connect' },
  { tool: 'delete', icon: '🗑️', label: 'Delete', tip: 'Click to delete' },
]

const NODES: ToolDef[] = [
  { tool: 'place-room', icon: '🚪', label: 'Room', tip: 'Place a room' },
  { tool: 'place-corridor', icon: '⬛', label: 'Corridor', tip: 'Place a corridor junction' },
  { tool: 'place-stair', icon: '🪜', label: 'Stair', tip: 'Place a staircase (links floors)' },
  { tool: 'place-elevator', icon: '🛗', label: 'Elevator', tip: 'Place an elevator (links floors)' },
  { tool: 'place-entry', icon: '➡️', label: 'Entry', tip: 'Place an entry point' },
  { tool: 'place-exit', icon: '🚪', label: 'Exit', tip: 'Place an exit point' },
  { tool: 'place-door', icon: '🔒', label: 'Door', tip: 'Place a door' },
]

export default function RoutingToolbar() {
  const { activeTool, snapToGrid, setTool, toggleSnapToGrid } = useRoutingEditorStore()

  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4,
    }}>
      <div style={{ width: '100%', fontSize: 9, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', padding: '4px 0', marginBottom: 2 }}>Tools</div>
      {TOOLS.map(t => (
        <button
          key={t.tool}
          className={`routing-tool-btn ${activeTool === t.tool ? 'active' : ''}`}
          onClick={() => setTool(t.tool)}
          title={t.tip}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}

      <hr className="routing-divider" style={{ width: '100%', margin: '2px 0' }} />
      <div style={{ width: '100%', fontSize: 9, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', padding: '4px 0', marginBottom: 2 }}>Nodes</div>
      {NODES.map(t => (
        <button
          key={t.tool}
          className={`routing-tool-btn ${activeTool === t.tool ? 'active' : ''}`}
          onClick={() => setTool(t.tool)}
          title={t.tip}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}

      <hr className="routing-divider" style={{ width: '100%', margin: '2px 0' }} />
      <button
        className={`routing-tool-btn ${snapToGrid ? 'active' : ''}`}
        onClick={toggleSnapToGrid}
        title="Toggle snap to grid"
      >
        <span style={{ fontSize: 16 }}>⊞</span>
        <span>Snap</span>
      </button>
    </div>
  )
}
