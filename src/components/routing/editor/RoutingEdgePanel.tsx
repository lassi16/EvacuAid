'use client'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'

export default function RoutingEdgePanel() {
  const { building, selectedEdgeId, updateEdge, deleteEdge } = useRoutingEditorStore()

  const allEdges = building.floors.flatMap(f => f.edges)
  const allNodes = building.floors.flatMap(f => f.nodes)
  const edge = allEdges.find(e => e.id === selectedEdgeId)

  if (!edge) return null

  const fromNode = allNodes.find(n => n.id === edge.from)
  const toNode = allNodes.find(n => n.id === edge.to)

  return (
    <div className="routing-animate-fade-in" style={{
      background: 'var(--routing-bg-card)', border: '1px solid var(--routing-border)',
      borderRadius: 10, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 13, color: 'var(--routing-text-secondary)', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#93C5FD' }}>{fromNode?.label ?? edge.from}</span>
        {' ↔ '}
        <span style={{ color: '#93C5FD' }}>{toNode?.label ?? edge.to}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="routing-label" style={{ margin: 0 }}>Weight</div>
        <input
          className="routing-input"
          type="number"
          min={1}
          value={edge.weight}
          onChange={e => updateEdge(edge.id, { weight: Math.max(1, Number(e.target.value)) })}
          style={{ width: 70 }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--routing-text-secondary)', whiteSpace: 'nowrap' }}>
        <input type="checkbox" checked={!!edge.danger} onChange={e => updateEdge(edge.id, { danger: e.target.checked || undefined })} />
        ⚠️ Danger
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--routing-text-secondary)', whiteSpace: 'nowrap' }}>
        <input type="checkbox" checked={!!edge.blocked} onChange={e => updateEdge(edge.id, { blocked: e.target.checked || undefined })} />
        🚫 Blocked
      </label>

      {edge.danger && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="routing-label" style={{ margin: 0 }}>Penalty</div>
          <input
            className="routing-input"
            type="number"
            min={0}
            value={edge.penalty ?? 50}
            onChange={e => updateEdge(edge.id, { penalty: Number(e.target.value) })}
            style={{ width: 60 }}
          />
        </div>
      )}

      <button className="routing-btn routing-btn-danger routing-btn-sm" onClick={() => deleteEdge(edge.id)}>Delete</button>
    </div>
  )
}
