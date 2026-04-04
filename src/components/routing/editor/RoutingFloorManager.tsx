'use client'
import { useRoutingEditorStore } from '@/stores/routingEditorStore'
import { exportBuildingJSON, importBuildingJSON } from '@/lib/routing/storage/persist'
import { HOTEL_SCENARIOS } from '@/lib/routing/graph/hotelExample'
import { useRef, useState } from 'react'

export default function RoutingFloorManager() {
  const { building, activeFloorId, setActiveFloor, addFloor, deleteFloor, renameFloor, setBuilding, resetToDefault } = useRoutingEditorStore()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [showScenarios, setShowScenarios] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const startEdit = (id: number, name: string) => { setEditingId(id); setEditName(name) }
  const saveEdit = () => {
    if (editingId !== null) renameFloor(editingId, editName || 'Unnamed')
    setEditingId(null)
  }

  return (
    <div style={{ width: '100%', padding: '4px 0px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Building name */}
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--routing-text-primary)', marginBottom: 4 }}>
        🏢 {building.name}
      </div>

      {/* Floors */}
      <div style={{ fontSize: 10, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Floors</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {building.floors.map(floor => (
          <div key={floor.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {editingId === floor.id ? (
              <input
                className="routing-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                autoFocus
                style={{ flex: 1, padding: '4px 6px', fontSize: 12 }}
              />
            ) : (
              <button
                className={`routing-floor-tab ${activeFloorId === floor.id ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'left' }}
                onClick={() => setActiveFloor(floor.id)}
                onDoubleClick={() => startEdit(floor.id, floor.name)}
                title="Double-click to rename"
              >
                {floor.name}
                <span style={{ fontSize: 10, color: 'var(--routing-text-muted)', marginLeft: 6 }}>
                  ({floor.nodes.length})
                </span>
              </button>
            )}
            {building.floors.length > 1 && (
              <button
                className="routing-btn routing-btn-danger"
                style={{ padding: '3px 5px', fontSize: 11, flexShrink: 0 }}
                onClick={() => deleteFloor(floor.id)}
                title="Delete floor"
              >✕</button>
            )}
          </div>
        ))}
      </div>

      <button className="routing-btn routing-btn-secondary routing-btn-sm" onClick={addFloor} style={{ width: '100%' }}>
        + Add Floor
      </button>

      <hr className="routing-divider" />

      {/* Scenarios */}
      <button className="routing-btn routing-btn-secondary routing-btn-sm" onClick={() => setShowScenarios(s => !s)} style={{ width: '100%' }}>
        🏨 Load Scenario
      </button>
      {showScenarios && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {HOTEL_SCENARIOS.map(s => (
            <div
              key={s.id}
              className="routing-scenario-card"
              style={{ padding: '8px 10px', fontSize: 12 }}
              onClick={() => { setBuilding(s.building); setShowScenarios(false) }}
            >
              <div style={{ fontWeight: 600 }}>{s.icon} {s.name}</div>
              <div style={{ color: 'var(--routing-text-muted)', marginTop: 4, lineHeight: 1.4 }}>{s.description}</div>
            </div>
          ))}
        </div>
      )}

      <hr className="routing-divider" />

      {/* Import/Export */}
      <div style={{ fontSize: 10, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data</div>
      <button className="routing-btn routing-btn-secondary routing-btn-sm" onClick={() => exportBuildingJSON(building)} style={{ width: '100%' }}>
        ⬇️ Export JSON
      </button>
      <button className="routing-btn routing-btn-secondary routing-btn-sm" onClick={() => fileRef.current?.click()} style={{ width: '100%' }}>
        ⬆️ Import JSON
      </button>
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={async e => {
        const file = e.target.files?.[0]
        if (file) { try { setBuilding(await importBuildingJSON(file)) } catch { alert('Invalid JSON') } }
        e.target.value = ''
      }} />
      <button className="routing-btn routing-btn-danger routing-btn-sm" onClick={() => { if (confirm('Reset to default hotel?')) resetToDefault() }} style={{ width: '100%' }}>
        ↩️ Reset
      </button>

      {/* Legend */}
      <hr className="routing-divider" />
      <div style={{ fontSize: 9, color: 'var(--routing-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Legend</div>
      {[
        ['#3B82F6', 'Room'], ['#6B7280', 'Corridor'], ['#F97316', 'Stair'],
        ['#A855F7', 'Elevator'], ['#22C55E', 'Entry'], ['#EF4444', 'Exit'], ['#EAB308', 'Door'],
      ].map(([color, label]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--routing-text-secondary)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
          {label}
        </div>
      ))}
    </div>
  )
}
