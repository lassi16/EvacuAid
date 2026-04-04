"use client"

import { useState } from "react"
import { Filter, MapPin, Plus, ChevronRight, CheckCircle2, Clock, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useIncidentStore, Task, TaskStatus } from "@/stores/incidentStore"

const PRIORITY_COLORS = {
  High:   { bg: 'rgba(239,68,68,0.15)',    text: '#F87171', border: 'rgba(239,68,68,0.3)' },
  Medium: { bg: 'rgba(245,158,11,0.15)',   text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
  Low:    { bg: 'rgba(148,163,184,0.1)',   text: '#94A3B8', border: 'rgba(148,163,184,0.2)' },
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  'New':         '#0284c7',
  'In Progress': '#F59E0B',
  'Acknowledged':'#34D399',
  'Resolved':    '#4B5563',
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  'New':          <Clock className="h-3 w-3" />,
  'In Progress':  <MoreHorizontal className="h-3 w-3" />,
  'Acknowledged': <CheckCircle2 className="h-3 w-3" />,
  'Resolved':     <CheckCircle2 className="h-3 w-3" />,
}

type SortKey = 'id' | 'priority' | 'status'

export default function TasksPage() {
  const { tasks, incidents, updateTaskStatus, pendingTaskCount } = useIncidentStore()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<'High' | 'Medium' | 'Low' | 'all'>('all')
  const [filterMap, setFilterMap] = useState(false)
  const [sort, setSort] = useState<SortKey>('id')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  // Enrich tasks with incident data
  const enriched = tasks.map(t => ({
    ...t,
    incident: incidents.find(i => i.id === t.incidentId),
  }))

  const filtered = enriched.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    if (filterMap && !t.incident?.mapLinked) return false
    return true
  })

  const totalTasks = tasks.length
  const resolvedTasks = tasks.filter(t => t.status === 'Resolved').length
  const mapLinkedTasks = tasks.filter(t => incidents.find(i => i.id === t.incidentId)?.mapLinked).length

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Task Board</h1>
          <p className="text-slate-500 text-sm">
            Response assignments and action tracking.
            {mapLinkedTasks > 0 && (
              <span style={{ marginLeft: 10, color: '#0284c7', fontWeight: 500 }}>
                · {mapLinkedTasks} from Building Map
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
            background: '#0ea5e9', color: '#fff',
          }}>
            <Plus className="h-4 w-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Total Tasks',    value: totalTasks,                                     color: '#0284c7', icon: '📋' },
          { label: 'Pending',        value: pendingTaskCount(),                              color: '#F59E0B', icon: '⏳' },
          { label: 'Resolved',       value: resolvedTasks,                                  color: '#34D399', icon: '✅' },
          { label: 'Map-Linked',     value: mapLinkedTasks,                                 color: '#0284c7', icon: '🗺' },
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
        <Filter className="h-3 w-3 text-slate-500" />
        {(['all', 'New', 'In Progress', 'Acknowledged', 'Resolved'] as (TaskStatus | 'all')[]).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: filterStatus === s ? 'rgba(14,165,233,0.15)' : 'transparent',
            color: filterStatus === s ? '#0284c7' : '#475569',
            border: `1px solid ${filterStatus === s ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.1)'}`,
          }}>{s}</button>
        ))}
        <div style={{ width: 1, height: 18, background: 'rgba(14,165,233,0.2)' }} />
        {(['all', 'High', 'Medium', 'Low'] as ('all' | 'High' | 'Medium' | 'Low')[]).map(p => (
          <button key={p} onClick={() => setFilterPriority(p)} style={{
            padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: filterPriority === p ? (p !== 'all' ? PRIORITY_COLORS[p].bg : 'rgba(14,165,233,0.15)') : 'transparent',
            color: filterPriority === p ? (p !== 'all' ? PRIORITY_COLORS[p].text : '#0284c7') : '#475569',
            border: `1px solid ${filterPriority === p ? (p !== 'all' ? PRIORITY_COLORS[p].border : 'rgba(14,165,233,0.35)') : 'rgba(14,165,233,0.1)'}`,
          }}>{p.toUpperCase()}</button>
        ))}
        <button onClick={() => setFilterMap(m => !m)} style={{
          padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
          background: filterMap ? 'rgba(14,165,233,0.15)' : 'transparent',
          color: filterMap ? '#0284c7' : '#475569',
          border: `1px solid ${filterMap ? 'rgba(14,165,233,0.35)' : 'rgba(14,165,233,0.1)'}`,
        }}>🗺 Map Only</button>
        <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto' }}>{filtered.length} tasks</span>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(task => {
          const prio = PRIORITY_COLORS[task.priority]
          const isExpanded = expandedTask === task.id
          const incident = task.incident

          return (
            <div key={task.id} style={{
              background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10,
              overflow: 'hidden', transition: 'border-color 0.15s',
            }}>
              {/* Main row */}
              <div
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
              >
                {/* Priority indicator */}
                <div style={{ width: 3, height: 36, borderRadius: 2, background: prio.text, flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0284c7', fontWeight: 600 }}>{task.id}</span>
                    {incident?.mapLinked && <span style={{ fontSize: 10, color: '#0284c7' }}>🗺</span>}
                    <span style={{ fontSize: 11, color: '#475569' }}>→</span>
                    <Link href="/incidents" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: '#0284c7', textDecoration: 'none', fontFamily: 'monospace' }}>
                      {task.incidentId}
                    </Link>
                  </div>
                  <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.description ?? `Respond to ${incident?.type ?? task.incidentId}`}
                  </div>
                </div>

                {/* Assignee */}
                <div style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0, minWidth: 90, textAlign: 'right' }}>
                  {task.assignee}
                </div>

                {/* Priority badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
                  borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0,
                  color: prio.text, background: prio.bg, border: `1px solid ${prio.border}`,
                }}>{task.priority}</span>

                {/* Status badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                  borderRadius: 999, fontSize: 11, fontWeight: 600, flexShrink: 0,
                  color: STATUS_COLORS[task.status],
                  background: `${STATUS_COLORS[task.status]}18`,
                  border: `1px solid ${STATUS_COLORS[task.status]}40`,
                }}>
                  {STATUS_ICONS[task.status]} {task.status}
                </span>

                <ChevronRight className="h-4 w-4 text-gray-600 flex-shrink-0" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: '0 16px 14px 16px', borderTop: '1px solid rgba(14,165,233,0.1)', paddingTop: 12 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                    {incident && (
                      <>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                          <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Incident Type</span>
                          {incident.type}
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                          <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Location</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin className="h-3 w-3 text-slate-500" /> {incident.location}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>
                          <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Team</span>
                          {incident.team}
                        </div>
                      </>
                    )}
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      <span style={{ color: '#475569', fontSize: 10, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Created</span>
                      {task.createdAt}
                    </div>
                  </div>

                  {/* Status quick-set */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['New', 'In Progress', 'Acknowledged', 'Resolved'] as TaskStatus[]).map(s => (
                      <button key={s} onClick={() => updateTaskStatus(task.id, s)} style={{
                        padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: task.status === s ? `${STATUS_COLORS[s]}20` : 'transparent',
                        color: task.status === s ? STATUS_COLORS[s] : '#475569',
                        border: `1px solid ${task.status === s ? STATUS_COLORS[s] + '60' : 'rgba(14,165,233,0.15)'}`,
                        transition: 'all 0.15s',
                      }}>
                        {s}
                      </button>
                    ))}
                    {incident?.mapLinked && (
                      <Link href="/map" style={{
                        marginLeft: 'auto', padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        textDecoration: 'none', color: '#0284c7',
                        background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)',
                      }}>
                        🗺 View on Map
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', padding: 60 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
            No tasks match your filters.
          </div>
        )}
      </div>
    </div>
  )
}
