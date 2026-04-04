"use client"

import { useState, useEffect } from "react"
import {
  Activity, Clock, Bell, CheckSquare, MapPin,
  Flame, Stethoscope, ShieldAlert, Wind, Biohazard,
  Wrench, Monitor, AlertTriangle, ChevronRight,
  CheckCircle2, XCircle, TrendingUp, Zap
} from "lucide-react"
import Link from "next/link"
import { useIncidentStore, Severity, IncidentStatus } from "@/stores/incidentStore"

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, React.ReactNode> = {
  Fire:        <Flame       className="h-3.5 w-3.5 text-red-400" />,
  Medical:     <Stethoscope className="h-3.5 w-3.5 text-orange-400" />,
  Security:    <ShieldAlert className="h-3.5 w-3.5 text-yellow-400" />,
  Smoke:       <Wind        className="h-3.5 w-3.5 text-slate-400" />,
  Hazmat:      <Biohazard   className="h-3.5 w-3.5 text-purple-400" />,
  Maintenance: <Wrench      className="h-3.5 w-3.5 text-slate-500" />,
  'IT Offline':<Monitor     className="h-3.5 w-3.5 text-blue-400" />,
}

const SEV_COLORS: Record<Severity, { bg: string; text: string; border: string; pill: string }> = {
  critical: { bg: 'rgba(239,68,68,0.12)',   text: '#F87171', border: 'rgba(239,68,68,0.3)',   pill: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  high:     { bg: 'rgba(249,115,22,0.12)',  text: '#FB923C', border: 'rgba(249,115,22,0.3)',  pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
  medium:   { bg: 'rgba(234,179,8,0.12)',   text: '#FCD34D', border: 'rgba(234,179,8,0.3)',   pill: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' },
  low:      { bg: 'rgba(148,163,184,0.08)', text: '#475569', border: 'rgba(148,163,184,0.2)', pill: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
}

const STATUS_DOT: Record<IncidentStatus, string> = {
  'New':         '#0284c7',
  'In Progress': '#F59E0B',
  'Acknowledged':'#34D399',
  'Resolved':    '#4B5563',
}

const TASK_PRIORITY_COLORS = {
  High:   'bg-red-500/15 text-red-400 border border-red-500/30',
  Medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  Low:    'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const ROLE_COLORS: Record<string, string> = {
  'Global Admin':   '#0284c7', 'Fire Dept': '#EF4444',
  'Medical Staff':  '#F97316', 'Security Team': '#EAB308',
  'Hazmat Unit':    '#A855F7', 'IT Dept': '#3B82F6', 'Operations': '#475569',
}

// ── Mini Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, accentColor, pulse, href
}: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; accentColor: string; pulse?: boolean; href: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#ffffff', borderRadius: 12,
        border: `1px solid ${accentColor}25`,
        padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: `0 0 20px ${accentColor}08`,
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}55`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${accentColor}18` }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accentColor}25`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${accentColor}08` }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</div>
          <div style={{ color: accentColor }}>{icon}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: accentColor, lineHeight: 1, ...(pulse ? { animation: 'pulse 2s ease-in-out infinite' } : {}) }}>{value}</div>
        </div>
        <div style={{ fontSize: 11, color: '#475569' }}>{sub}</div>
      </div>
    </Link>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHeader({ title, sub, href, linkLabel }: { title: string; sub: string; href: string; linkLabel: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{sub}</div>
      </div>
      <Link href={href} style={{
        fontSize: 11, fontWeight: 600, color: '#0284c7', textDecoration: 'none',
        padding: '4px 10px', borderRadius: 6,
        background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)',
      }}>
        {linkLabel} →
      </Link>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [countdown, setCountdown] = useState(120)

  const {
    incidents, tasks, notifications,
    activeCount, criticalCount, unreadCount, pendingTaskCount,
  } = useIncidentStore()

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 120), 1000)
    return () => clearInterval(t)
  }, [])

  // Derived slices
  const activeIncidents = incidents.filter(i => i.status !== 'Resolved')
  const recentIncidents = incidents.slice(0, 5)
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'Resolved')
  const pendingTasks = tasks.filter(t => t.status !== 'Resolved').slice(0, 5)
  const unreadNotifs = notifications.filter(n => !n.ack).slice(0, 4)
  const mapLinkedActive = incidents.filter(i => i.mapLinked && i.status !== 'Resolved').length
  const resolvedToday = incidents.filter(i => i.status === 'Resolved').length
  const ackRate = notifications.length > 0
    ? Math.round((notifications.filter(n => n.ack).length / notifications.length) * 100) : 0

  // Build timeline from live data
  const timelineItems = [
    ...incidents.slice(0, 3).map(i => ({
      label: `[${i.id}] ${i.type} — ${i.location}`,
      time: i.time,
      color: i.severity === 'critical' ? '#EF4444' : i.severity === 'high' ? '#F97316' : '#0284c7',
      prefix: i.severity === 'critical' ? 'CRITICAL' : i.severity === 'high' ? 'ALERT' : 'SYSTEM',
    })),
    ...tasks.filter(t => t.status === 'Resolved').slice(0, 2).map(t => ({
      label: `Task ${t.id} resolved — ${t.description ?? t.incidentId}`,
      time: t.createdAt,
      color: '#34D399',
      prefix: 'RESOLVED',
    })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Command Dashboard
          </h1>
          <p style={{ color: '#475569', fontSize: 13, margin: '4px 0 0' }}>
            Real-time overview of all active operations.
            {mapLinkedActive > 0 && (
              <Link href="/map" style={{ color: '#0284c7', fontWeight: 600, marginLeft: 10, textDecoration: 'none' }}>
                · {mapLinkedActive} emergencies on Building Map
              </Link>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {criticalCount() > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
              background: 'rgba(239,68,68,0.12)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
              animation: 'pulse 2s ease-in-out infinite',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 6px rgba(239,68,68,0.8)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F87171' }}>{criticalCount()} CRITICAL</span>
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px',
            background: '#ffffff', borderRadius: 8, border: '1px solid rgba(14,165,233,0.2)',
            fontFamily: 'monospace', fontSize: 13, color: '#475569',
          }}>
            <Clock className="h-3.5 w-3.5 text-red-500" />
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* ── Stat Cards (live counts) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <StatCard label="Active Incidents" value={activeCount()} sub={`${mapLinkedActive} from Building Map`}
          icon={<Activity className="h-5 w-5" />} accentColor="#F97316" href="/incidents" />
        <StatCard label="Critical Alerts" value={criticalCount()} sub="Requires immediate attention"
          icon={<AlertTriangle className="h-5 w-5" />} accentColor="#EF4444" pulse href="/incidents" />
        <StatCard label="Pending Tasks" value={pendingTaskCount()} sub={`${resolvedToday} resolved today`}
          icon={<CheckSquare className="h-5 w-5" />} accentColor="#34D399" href="/tasks" />
        <StatCard label="Unread Alerts" value={unreadCount()} sub={`${ackRate}% ACK rate overall`}
          icon={<Bell className="h-5 w-5" />} accentColor="#0284c7" href="/notifications" />
      </div>

      {/* ── Main 3-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* ── Col 1: Recent Incidents ── */}
        <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)', padding: '16px 18px' }}>
          <SectionHeader title="Recent Incidents" sub="Live anomaly log" href="/incidents" linkLabel="All Incidents" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentIncidents.map(inc => {
              const sev = SEV_COLORS[inc.severity]
              return (
                <Link key={inc.id} href="/incidents" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    background: `${sev.bg}`, border: `1px solid ${sev.border}`,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${sev.bg}` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {TYPE_ICON[inc.type] ?? <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />}
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#0284c7', fontWeight: 600 }}>{inc.id}</span>
                        {inc.mapLinked && <span style={{ fontSize: 10 }}>🗺</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                          color: sev.text, background: `${sev.text}18`, border: `1px solid ${sev.border}`,
                        }}>
                          {inc.severity.toUpperCase()}
                        </span>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT[inc.status], display: 'inline-block' }} title={inc.status} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0f172a', fontWeight: 500, marginBottom: 2 }}>
                      {inc.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569' }}>
                      <MapPin className="h-2.5 w-2.5" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.location}</span>
                      <span style={{ marginLeft: 'auto', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{inc.time}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
            {recentIncidents.length === 0 && (
              <div style={{ textAlign: 'center', color: '#475569', padding: '24px 0', fontSize: 12 }}>No incidents recorded</div>
            )}
          </div>
        </div>

        {/* ── Col 2: Pending Tasks + Priority Alerts ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Priority Alerts (critical/high from live store) */}
          <div style={{
            background: '#ffffff', borderRadius: 12,
            border: criticalCount() > 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(14,165,233,0.15)',
            padding: '0', overflow: 'hidden',
            boxShadow: criticalCount() > 0 ? '0 0 20px rgba(239,68,68,0.08)' : 'none',
          }}>
            <div style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: criticalCount() > 0 ? 'rgba(239,68,68,0.08)' : 'transparent',
              borderBottom: '1px solid rgba(14,165,233,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: criticalCount() > 0 ? '#EF4444' : '#34D399', boxShadow: criticalCount() > 0 ? '0 0 8px rgba(239,68,68,0.7)' : 'none', display: 'inline-block', animation: criticalCount() > 0 ? 'pulse 2s ease-in-out infinite' : 'none' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: criticalCount() > 0 ? '#F87171' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Priority Alerts</span>
              </div>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div style={{ padding: '0' }}>
              {criticalIncidents.slice(0, 2).map((inc, i) => (
                <Link key={inc.id} href="/incidents" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '12px 16px', borderBottom: i < criticalIncidents.length - 1 ? '1px solid rgba(239,68,68,0.1)' : 'none',
                    background: 'rgba(239,68,68,0.04)', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#F87171', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 6px', borderRadius: 4, animation: 'pulse 2s ease-in-out infinite' }}>CRITICAL</span>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>{inc.time}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>
                      {inc.type} — {inc.location}
                    </div>
                    {inc.description && (
                      <div style={{ fontSize: 11, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.description}</div>
                    )}
                    {/* Countdown only for the first critical */}
                    {i === 0 && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.04)', borderRadius: 6, padding: '4px 10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <span style={{ fontSize: 10, color: '#475569' }}>Auto-Escalation in:</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#EF4444' }}>
                          {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {criticalIncidents.length === 0 && (
                <div style={{ padding: '20px 16px', textAlign: 'center', color: '#475569', fontSize: 12 }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>✅</div>
                  No critical alerts right now
                </div>
              )}
              <Link href="/incidents" style={{ display: 'block', padding: '10px 16px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#0284c7', textDecoration: 'none', borderTop: '1px solid rgba(14,165,233,0.12)', background: 'rgba(14,165,233,0.04)' }}>
                View All {activeIncidents.length} Active Incidents →
              </Link>
            </div>
          </div>

          {/* Pending Tasks */}
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)', padding: '16px 18px', flex: 1 }}>
            <SectionHeader title="Pending Tasks" sub={`${pendingTaskCount()} open assignments`} href="/tasks" linkLabel="Task Board" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {pendingTasks.map(task => (
                <Link key={task.id} href="/tasks" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '8px 10px', borderRadius: 7, cursor: 'pointer', transition: 'all 0.15s',
                    background: 'var(--routing-bg-surface, #f8fafc)', border: '1px solid rgba(14,165,233,0.12)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.12)' }}
                  >
                    <div style={{ width: 3, height: 32, borderRadius: 2, background: task.priority === 'High' ? '#EF4444' : task.priority === 'Medium' ? '#F59E0B' : '#475569', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#0284c7', fontWeight: 600 }}>{task.id}</span>
                        <span style={{ fontSize: 9, color: '#475569' }}>→</span>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#0284c7' }}>{task.incidentId}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.description ?? task.incidentId}
                      </div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, flexShrink: 0, color: task.priority === 'High' ? '#F87171' : task.priority === 'Medium' ? '#FCD34D' : '#475569', background: task.priority === 'High' ? 'rgba(239,68,68,0.15)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.1)', border: `1px solid ${task.priority === 'High' ? 'rgba(239,68,68,0.3)' : task.priority === 'Medium' ? 'rgba(245,158,11,0.3)' : 'rgba(148,163,184,0.2)'}` }}>
                      {task.priority}
                    </span>
                  </div>
                </Link>
              ))}
              {pendingTasks.length === 0 && (
                <div style={{ textAlign: 'center', color: '#475569', padding: '16px 0', fontSize: 12 }}>All tasks resolved ✅</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Col 3: Notifications + Map Quick-access ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Unread Notifications */}
          <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)', padding: '16px 18px', flex: 1 }}>
            <SectionHeader title="Notification Center" sub={`${unreadCount()} unread · ${ackRate}% ACK rate`} href="/notifications" linkLabel="All Alerts" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {unreadNotifs.map(n => {
                const inc = incidents.find(i => i.id === n.incidentId)
                const roleColor = ROLE_COLORS[n.role] ?? '#475569'
                return (
                  <Link key={n.id} href="/notifications" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '9px 11px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                      background: '#f8fafc', border: `1px solid ${n.escalated ? 'rgba(239,68,68,0.3)' : 'rgba(14,165,233,0.15)'}`,
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.ack ? 'transparent' : '#0ea5e9', boxShadow: n.ack ? 'none' : '0 0 6px rgba(14,165,233,0.6)', flexShrink: 0, marginTop: 4 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{n.user}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: roleColor, textTransform: 'uppercase' }}>{n.role}</span>
                          </div>
                          {n.escalated && (
                            <span style={{ fontSize: 8, fontWeight: 800, color: '#F87171', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 5px', borderRadius: 4 }}>ESC</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          {inc && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: '#0284c7', background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)', padding: '1px 5px', borderRadius: 4 }}>
                              {n.incidentId} {inc.mapLinked ? '🗺' : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {n.ack ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" style={{ animation: 'pulse 2s ease-in-out infinite' }} />}
                      </div>
                    </div>
                  </Link>
                )
              })}
              {unreadNotifs.length === 0 && (
                <div style={{ textAlign: 'center', color: '#475569', padding: '16px 0', fontSize: 12 }}>All notifications acknowledged ✅</div>
              )}
            </div>
          </div>

          {/* Quick Access: Building Map */}
          <Link href="/map" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: 12, border: '1px solid rgba(14,165,233,0.25)', padding: '16px 18px',
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(14,165,233,0.15)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(14,165,233,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(14,165,233,0.06)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🗺</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Building Map</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>A* Facility Routing Engine</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(52,211,153,0.1)', borderRadius: 6, border: '1px solid rgba(52,211,153,0.25)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 6px rgba(52,211,153,0.6)', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>Engine Active</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Map Incidents', value: mapLinkedActive, color: '#F87171' },
                  { label: 'Hazard Types', value: 5, color: '#0284c7' },
                  { label: 'Algorithms', value: 2, color: '#34D399' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 7, padding: '8px 10px', border: '1px solid rgba(14,165,233,0.1)' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: '#0284c7', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap className="h-3 w-3" /> Open routing engine & simulate emergencies
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Live System Timeline ── */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid rgba(14,165,233,0.15)', overflow: 'hidden' }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity className="h-3.5 w-3.5 text-indigo-400" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Timeline</span>
          <TrendingUp className="h-3 w-3 text-green-400 ml-auto" />
          <span style={{ fontSize: 10, color: '#34D399', fontWeight: 600 }}>Live</span>
        </div>
        <div style={{ height: 38, display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative', background: 'rgba(0,0,0,0.04)' }}>
          <div style={{ position: 'absolute', left: 0, width: 40, height: '100%', background: 'linear-gradient(to right, #ffffff, transparent)', zIndex: 10 }} />
          <div style={{ position: 'absolute', right: 0, width: 40, height: '100%', background: 'linear-gradient(to left, #ffffff, transparent)', zIndex: 10 }} />
          <div style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
            {[...timelineItems, ...timelineItems].map((item, i) => (
              <span key={i}>
                <span style={{ color: item.color, fontWeight: 700 }}>[{item.time}]</span>
                {' '}<span style={{ color: item.color, opacity: 0.7 }}>{item.prefix}:</span>
                {' '}{item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      ` }} />
    </div>
  )
}
