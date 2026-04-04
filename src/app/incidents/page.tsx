"use client"

import { useState } from "react"
import {
  AlertTriangle,
  Flame,
  Stethoscope,
  ShieldAlert,
  ChevronRight,
  Filter,
  MapPin,
  Wind,
  Biohazard,
  Wrench,
  Monitor,
  AlertCircle,
  X,
} from "lucide-react"
import Link from "next/link"
import { useIncidentStore, Incident, IncidentStatus, Severity } from "@/stores/incidentStore"

const TYPE_ICON: Record<string, React.ReactNode> = {
  Fire:        <Flame className="h-4 w-4 text-red-400" />,
  Medical:     <Stethoscope className="h-4 w-4 text-orange-400" />,
  Security:    <ShieldAlert className="h-4 w-4 text-yellow-400" />,
  Smoke:       <Wind className="h-4 w-4 text-slate-400" />,
  Hazmat:      <Biohazard className="h-4 w-4 text-purple-400" />,
  Maintenance: <Wrench className="h-4 w-4 text-slate-500" />,
  'IT Offline':<Monitor className="h-4 w-4 text-blue-400" />,
}

const SEV_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)',    text: '#F87171', border: 'rgba(239,68,68,0.3)' },
  high:     { bg: 'rgba(249,115,22,0.15)',   text: '#FB923C', border: 'rgba(249,115,22,0.3)' },
  medium:   { bg: 'rgba(234,179,8,0.15)',    text: '#FCD34D', border: 'rgba(234,179,8,0.3)' },
  low:      { bg: 'rgba(148,163,184,0.1)',   text: '#94A3B8', border: 'rgba(148,163,184,0.2)' },
}

const STATUS_COLORS: Record<IncidentStatus, string> = {
  'New':         '#0284c7',
  'In Progress': '#F59E0B',
  'Acknowledged':'#34D399',
  'Resolved':    '#4B5563',
}

type FilterSev = Severity | 'all'
type FilterStatus = IncidentStatus | 'all'

function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 999, fontSize: 10, fontWeight: 700,
      color, background: bg, border: `1px solid ${border}`,
    }}>
      {label}
    </span>
  )
}

function IncidentDetailPanel({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const { updateIncidentStatus } = useIncidentStore()
  const sev = SEV_COLORS[incident.severity]

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, zIndex: 50,
      background: '#ffffff', borderLeft: '1px solid rgba(14,165,233,0.2)',
      display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(14,165,233,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 2 }}>{incident.id}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{incident.type} Incident</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Severity & Status */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge label={incident.severity.toUpperCase()} color={sev.text} bg={sev.bg} border={sev.border} />
          <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
            borderRadius: 999, fontSize: 10, fontWeight: 700,
            color: STATUS_COLORS[incident.status],
            background: `${STATUS_COLORS[incident.status]}20`,
            border: `1px solid ${STATUS_COLORS[incident.status]}40`,
          }}>
            {incident.status}
          </span>
          {incident.mapLinked && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px',
              borderRadius: 999, fontSize: 10, fontWeight: 700,
              color: '#0284c7', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)',
            }}>
              🗺 Map Linked
            </span>
          )}
        </div>

        {/* Info grid */}
        {[
          { label: 'Location', value: incident.location },
          { label: 'Assigned Team', value: incident.team },
          { label: 'Time', value: incident.time },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{value}</div>
          </div>
        ))}

        {incident.description && (
          <div>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Description</div>
            <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, background: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid rgba(14,165,233,0.15)' }}>
              {incident.description}
            </div>
          </div>
        )}

        {/* Status control */}
        <div>
          <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Update Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(['New', 'In Progress', 'Acknowledged', 'Resolved'] as IncidentStatus[]).map(s => (
              <button
                key={s}
                style={{
                  padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  background: incident.status === s ? `${STATUS_COLORS[s]}20` : 'transparent',
                  border: `1px solid ${incident.status === s ? STATUS_COLORS[s] + '60' : 'rgba(14,165,233,0.15)'}`,
                  color: incident.status === s ? STATUS_COLORS[s] : '#94A3B8',
                }}
                onClick={() => updateIncidentStatus(incident.id, s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {incident.mapLinked && (
          <Link href="/map" style={{
            display: 'block', padding: '10px 14px', borderRadius: 8, textAlign: 'center',
            background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)',
            color: '#0284c7', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>
            🗺 View on Building Map
          </Link>
        )}
      </div>
    </div>
  )
}

export default function IncidentsPage() {
  const { incidents, criticalCount, activeCount, updateIncidentStatus } = useIncidentStore()
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [filterSev, setFilterSev] = useState<FilterSev>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterMap, setFilterMap] = useState<boolean>(false)
  const [search, setSearch] = useState('')

  const filtered = incidents.filter(inc => {
    if (filterSev !== 'all' && inc.severity !== filterSev) return false
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false
    if (filterMap && !inc.mapLinked) return false
    if (search && !inc.id.toLowerCase().includes(search.toLowerCase()) &&
        !inc.type.toLowerCase().includes(search.toLowerCase()) &&
        !inc.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const mapLinkedCount = incidents.filter(i => i.mapLinked && i.status !== 'Resolved').length

  return (
    <div className="space-y-4 flex flex-col h-full relative">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Incidents Hub</h1>
          <p className="text-slate-500 text-sm">
            Master log of all recorded anomalies and events.
            {mapLinkedCount > 0 && (
              <span style={{ marginLeft: 10, color: '#0284c7', fontWeight: 500 }}>
                · {mapLinkedCount} from Building Map
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/map" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
            background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.35)',
            color: '#0284c7',
          }}>
            🗺 Open Map
          </Link>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: '#EF4444', color: '#fff',
          }}>
            <AlertCircle className="h-4 w-4" /> Declare Emergency
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Total Incidents',   value: incidents.length,                                                        color: '#0284c7', icon: '📋' },
          { label: 'Active',            value: activeCount(),                                                           color: '#F59E0B', icon: '🚨' },
          { label: 'Critical',          value: criticalCount(),                                                         color: '#EF4444', icon: '🔥' },
          { label: 'Map-Linked Active', value: incidents.filter(i => i.mapLinked && i.status !== 'Resolved').length,    color: '#0284c7', icon: '🗺' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            background: '#ffffff', border: `1px solid ${color}30`, borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{icon} {label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ID, type, location…"
          style={{
            background: '#f8fafc', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 7,
            padding: '6px 12px', fontSize: 12, color: '#0f172a', outline: 'none',
          }}
        />
        <Filter className="h-3 w-3 text-slate-500" />
        {(['all', 'critical', 'high', 'medium', 'low'] as FilterSev[]).map(s => (
          <button key={s} onClick={() => setFilterSev(s)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: filterSev === s ? (s === 'all' ? 'rgba(14,165,233,0.2)' : SEV_COLORS[s as Severity]?.bg ?? 'rgba(14,165,233,0.2)') : 'transparent',
            color: filterSev === s ? (s === 'all' ? '#0284c7' : SEV_COLORS[s as Severity]?.text ?? '#0284c7') : '#475569',
            border: `1px solid ${filterSev === s ? (s === 'all' ? 'rgba(14,165,233,0.4)' : SEV_COLORS[s as Severity]?.border ?? 'rgba(14,165,233,0.4)') : 'rgba(14,165,233,0.1)'}`,
          }}>
            {s.toUpperCase()}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: 'rgba(14,165,233,0.2)' }} />
        {(['all', 'New', 'In Progress', 'Acknowledged', 'Resolved'] as FilterStatus[]).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: filterStatus === s ? 'rgba(14,165,233,0.15)' : 'transparent',
            color: filterStatus === s ? '#0284c7' : '#475569',
            border: `1px solid ${filterStatus === s ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.1)'}`,
          }}>
            {s}
          </button>
        ))}
        <button onClick={() => setFilterMap(m => !m)} style={{
          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          background: filterMap ? 'rgba(14,165,233,0.15)' : 'transparent',
          color: filterMap ? '#0284c7' : '#475569',
          border: `1px solid ${filterMap ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.1)'}`,
        }}>
          🗺 Map Only
        </button>
        <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div style={{
        flex: 1, overflowY: 'auto', border: '1px solid rgba(14,165,233,0.15)',
        borderRadius: 10, background: '#ffffff',
      }}>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(14,165,233,0.15)', background: '#f8fafc' }}>
              {['ID', 'Type', 'Severity', 'Status', 'Time', 'Location', 'Team', 'Source'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(incident => {
              const sev = SEV_COLORS[incident.severity]
              return (
                <tr
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  style={{
                    borderBottom: '1px solid rgba(14,165,233,0.08)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(14,165,233,0.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 600 }}>{incident.id}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#94A3B8' }}>
                      {TYPE_ICON[incident.type] ?? <AlertTriangle className="h-4 w-4 text-slate-500" />}
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>{incident.type}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge label={incident.severity.toUpperCase()} color={sev.text} bg={sev.bg} border={sev.border} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                      borderRadius: 999, fontSize: 10, fontWeight: 700,
                      color: STATUS_COLORS[incident.status],
                      background: `${STATUS_COLORS[incident.status]}18`,
                      border: `1px solid ${STATUS_COLORS[incident.status]}40`,
                    }}>
                      {incident.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94A3B8', fontFamily: 'monospace', fontSize: 12 }}>{incident.time}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0f172a' }}>
                      <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <span style={{ fontSize: 12 }}>{incident.location}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94A3B8' }}>{incident.team}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {incident.mapLinked ? (
                      <span style={{ fontSize: 11, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 4 }}>🗺 Map</span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#475569' }}>Manual</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
                  No incidents match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selectedIncident && (
        <IncidentDetailPanel incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
      )}
    </div>
  )
}
