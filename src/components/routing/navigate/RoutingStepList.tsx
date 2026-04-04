'use client'
import { useRoutingNavigationStore } from '@/stores/routingNavigationStore'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'

export default function RoutingStepList() {
  const { path, isComputing } = useRoutingNavigationStore()
  const { building } = useRoutingEditorStore()

  if (isComputing) {
    return (
      <div className="routing-animate-fade-in" style={{ width: '100%', padding: '24px 0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--routing-text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>Computing path…</div>
        </div>
      </div>
    )
  }

  if (!path) {
    return (
      <div style={{ width: '100%', padding: '4px 0px' }}>
        <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Navigation Steps</div>
        <div style={{ textAlign: 'center', color: 'var(--routing-text-muted)', marginTop: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>Select start &amp; destination, then click <b style={{ color: 'var(--routing-text-secondary)' }}>Find Shortest Path</b> to see turn-by-turn navigation.</div>
        </div>
      </div>
    )
  }

  const allNodes = new Map(building.floors.flatMap(f => f.nodes).map(n => [n.id, n]))
  const startNode = allNodes.get(path.nodeIds[0])
  const endNode = allNodes.get(path.nodeIds[path.nodeIds.length - 1])
  const startFloor = building.floors.find(f => f.id === startNode?.floorId)
  const endFloor = building.floors.find(f => f.id === endNode?.floorId)

  return (
    <div className="routing-animate-fade-in" style={{ width: '100%', padding: '4px 0px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>

      {/* Summary */}
      <div style={{ background: 'var(--routing-bg-surface)', borderRadius: 8, padding: 12, border: '1px solid var(--routing-border)' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--routing-text-primary)', marginBottom: 8 }}>Route Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--routing-text-secondary)', lineHeight: 1.8 }}>
          <div>
            <div style={{ color: 'var(--routing-text-muted)', fontSize: 10 }}>FROM</div>
            <div>{startNode?.label}</div>
            <div style={{ fontSize: 10, color: 'var(--routing-text-muted)' }}>{startFloor?.name}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 18 }}>→</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--routing-text-muted)', fontSize: 10 }}>TO</div>
            <div>{endNode?.label}</div>
            <div style={{ fontSize: 10, color: 'var(--routing-text-muted)' }}>{endFloor?.name}</div>
          </div>
        </div>
        <hr className="routing-divider" style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: 'var(--routing-text-muted)' }}>Algorithm</span>
          <span className="routing-badge routing-badge-primary" style={{ fontSize: 10 }}>{path.algorithm === 'astar' ? '⚡ A*' : '🔄 Dijkstra'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
          <span style={{ color: 'var(--routing-text-muted)' }}>Cost</span>
          <span style={{ color: '#0284c7', fontFamily: 'monospace' }}>{path.totalCost.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
          <span style={{ color: 'var(--routing-text-muted)' }}>Compute time</span>
          <span style={{ color: '#34D399', fontFamily: 'monospace' }}>{path.computeTimeMs.toFixed(2)}ms</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
          <span style={{ color: 'var(--routing-text-muted)' }}>Steps</span>
          <span style={{ color: 'var(--routing-text-secondary)' }}>{path.steps.length}</span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Turn-by-Turn</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {path.steps.map((step, i) => (
          <div
            key={i}
            className={`routing-step-item routing-animate-fade-in ${step.type === 'walk' ? 'walk' : 'floor-change'}`}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              {step.type === 'walk' ? '🚶' : step.method === 'elevator' ? '🛗' : '🪜'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--routing-text-primary)', fontSize: 12, fontWeight: 500 }}>
                {step.description}
              </div>
              {step.type === 'floor_change' && (
                <div style={{ fontSize: 11, marginTop: 3 }}>
                  <span className={`routing-badge ${step.method === 'elevator' ? 'routing-badge-primary' : 'routing-badge-warning'}`} style={{ fontSize: 10 }}>
                    {step.method === 'elevator' ? '🛗 Elevator' : '🪜 Stairs'}
                  </span>
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--routing-text-muted)', fontFamily: 'monospace', flexShrink: 0, alignSelf: 'flex-start' }}>
              {String(i + 1).padStart(2, '0')}
            </div>
          </div>
        ))}

        {/* Final step */}
        <div className="routing-step-item routing-animate-fade-in" style={{ borderLeftColor: '#10B981', animationDelay: `${path.steps.length * 30}ms` }}>
          <div>🎯</div>
          <div style={{ color: '#34D399', fontSize: 12, fontWeight: 600 }}>
            Arrived at {endNode?.label}
          </div>
        </div>
      </div>

      {/* Node list */}
      <div style={{ fontSize: 11, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Path Nodes ({path.nodeIds.length})</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {path.nodeIds.map((id, i) => {
          const n = allNodes.get(id)
          return (
            <span key={id} className="routing-badge routing-badge-primary" style={{ fontSize: 10 }}>
              {i + 1}. {n?.label ?? id}
            </span>
          )
        })}
      </div>
    </div>
  )
}
