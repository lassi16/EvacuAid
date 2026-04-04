'use client'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'
import { NodeType } from '@/lib/routing/graph/types'

const NODE_TYPE_OPTIONS: { value: NodeType; label: string }[] = [
  { value: 'room', label: '🚪 Room' },
  { value: 'corridor', label: '⬛ Corridor' },
  { value: 'stair', label: '🪜 Staircase' },
  { value: 'elevator', label: '🛗 Elevator' },
  { value: 'entry', label: '➡️ Entry' },
  { value: 'exit', label: '🚪 Exit' },
  { value: 'door', label: '🔒 Door' },
]

export default function RoutingNodePanel() {
  const { building, selectedNodeId, updateNode } = useRoutingEditorStore()

  const allNodes = building.floors.flatMap(f => f.nodes)
  const node = allNodes.find(n => n.id === selectedNodeId)

  if (!node) {
    return (
      <div style={{ width: '100%', padding: '4px 0px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties</div>
        <div style={{ color: 'var(--routing-text-muted)', fontSize: 13, textAlign: 'center', marginTop: 40, lineHeight: 1.7 }}>
          Select a node or edge to view and edit its properties.
          <br /><br />
          <span style={{ fontSize: 20 }}>↖️</span>
        </div>
        <hr className="routing-divider" />
        <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', lineHeight: 1.6 }}>
          <b style={{ color: 'var(--routing-text-secondary)' }}>Shortcuts:</b><br />
          • Select tool: click to select<br />
          • Drag nodes to move<br />
          • Edge tool: click 2 nodes<br />
          • Delete tool: click to remove<br />
          • Double-click floor name to rename
        </div>
      </div>
    )
  }

  const floor = building.floors.find(f => f.id === node.floorId)

  return (
    <div className="routing-animate-fade-in" style={{ width: '100%', padding: '4px 0px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Properties</div>
        <span className="routing-badge routing-badge-primary" style={{ fontSize: 10 }}>{node.type}</span>
      </div>

      <div style={{ fontSize: 10, color: 'var(--routing-text-muted)', fontFamily: 'monospace' }}>
        ID: {node.id}
      </div>

      <div>
        <div className="routing-label">Label</div>
        <input
          className="routing-input"
          value={node.label}
          onChange={e => updateNode(node.id, { label: e.target.value })}
        />
      </div>

      <div>
        <div className="routing-label">Type</div>
        <select
          className="routing-select"
          value={node.type}
          onChange={e => updateNode(node.id, { type: e.target.value as NodeType })}
        >
          {NODE_TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div className="routing-label">X</div>
          <input
            className="routing-input"
            type="number"
            value={node.x}
            onChange={e => updateNode(node.id, { x: Number(e.target.value) })}
          />
        </div>
        <div>
          <div className="routing-label">Y</div>
          <input
            className="routing-input"
            type="number"
            value={node.y}
            onChange={e => updateNode(node.id, { y: Number(e.target.value) })}
          />
        </div>
      </div>

      {(node.type === 'stair' || node.type === 'elevator') && (
        <div>
          <div className="routing-label">Link ID (for cross-floor)</div>
          <input
            className="routing-input"
            value={node.linkId ?? ''}
            placeholder="e.g. stair-main"
            onChange={e => updateNode(node.id, { linkId: e.target.value || undefined })}
          />
          <div style={{ fontSize: 10, color: 'var(--routing-text-muted)', marginTop: 4 }}>
            Same link ID on other floors creates cross-floor connections.
          </div>
        </div>
      )}

      <hr className="routing-divider" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--routing-text-secondary)' }}>
          <input
            type="checkbox"
            checked={!!node.danger}
            onChange={e => updateNode(node.id, { danger: e.target.checked || undefined })}
          />
          <span>⚠️ Mark as Dangerous</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--routing-text-secondary)' }}>
          <input
            type="checkbox"
            checked={!!node.blocked}
            onChange={e => updateNode(node.id, { blocked: e.target.checked || undefined })}
          />
          <span>🚫 Mark as Blocked</span>
        </label>
      </div>

      <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', background: 'var(--routing-bg-surface)', padding: 8, borderRadius: 6, lineHeight: 1.5 }}>
        Floor: <span style={{ color: 'var(--routing-text-secondary)' }}>{floor?.name}</span>
      </div>
    </div>
  )
}
