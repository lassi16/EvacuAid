'use client'
/**
 * Central EvacuAid Incident Store
 * ──────────────────────────────────
 * Single source of truth that connects:
 *  - Building Map emergency nodes  (from routingNavigationStore / routingEditorStore)
 *  - Incidents Hub
 *  - Task Management
 *  - Notification Center
 *
 * When the admin places an emergency marker on the map, a matching Incident,
 * Task and Notification are auto-generated and appear in the respective pages.
 * Existing "manual" records can also be added from the Incidents/Tasks pages.
 */
import { create } from 'zustand'
import { EmergencyType } from '@/lib/routing/graph/types'

// ──────────────────────── Types ───────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type IncidentStatus = 'New' | 'In Progress' | 'Acknowledged' | 'Resolved'
export type TaskStatus = 'New' | 'In Progress' | 'Acknowledged' | 'Resolved'
export type NotifStatus = 'unread' | 'read' | 'escalated'

export interface Incident {
  id: string
  type: string          // 'Fire' | 'Medical' | 'Security' | 'Smoke' | 'Hazmat' | …
  severity: Severity
  status: IncidentStatus
  time: string
  location: string      // human-readable: "Floor 3 – NE Corridor"
  team: string
  nodeId?: string       // linked map node (if from building map)
  floorId?: number
  mapLinked: boolean    // true when created from the building map
  description?: string
}

export interface Task {
  id: string
  incidentId: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  status: TaskStatus
  createdAt: string
  description?: string
}

export interface Notification {
  id: string
  incidentId: string
  user: string
  role: string
  time: string
  opened: boolean
  ack: boolean
  escalated: boolean
  message: string
}

// ──────────────────────── Helpers ─────────────────────────────────────────────

let incCounter = 2050
let tskCounter = 100
let ntfCounter = 200

function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function parseCounter(id: string, prefix: string) {
  if (!id.startsWith(`${prefix}-`)) return 0
  const raw = id.slice(prefix.length + 1)
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : 0
}

function syncLocalCounters(incidents: Incident[], tasks: Task[], notifications: Notification[]) {
  incCounter = Math.max(incCounter, ...incidents.map(i => parseCounter(i.id, 'INC')))
  tskCounter = Math.max(tskCounter, ...tasks.map(t => parseCounter(t.id, 'TSK')))
  ntfCounter = Math.max(ntfCounter, ...notifications.map(n => parseCounter(n.id, 'NTF')))
}

function postJSON(url: string, body: unknown) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(err => console.error(`POST ${url} failed`, err))
}

function patchJSON(url: string, body?: unknown) {
  fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(err => console.error(`PATCH ${url} failed`, err))
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function emergencyToIncident(nodeId: string, nodeName: string, floorName: string, emergencyType: EmergencyType): Incident {
  const typeMap: Record<EmergencyType, { type: string; severity: Severity; team: string; desc: string }> = {
    fire:     { type: 'Fire',     severity: 'critical', team: 'Fire Dept',    desc: 'Fire / smoke detected by building map sensor.' },
    medical:  { type: 'Medical',  severity: 'high',     team: 'Medical Staff', desc: 'Medical emergency flagged via building map.' },
    security: { type: 'Security', severity: 'medium',   team: 'Security Team', desc: 'Security alert raised on building map.' },
    smoke:    { type: 'Smoke',    severity: 'high',     team: 'Fire Dept',    desc: 'Smoke sensor triggered on building map.' },
    hazmat:   { type: 'Hazmat',   severity: 'critical', team: 'Hazmat Unit',  desc: 'Hazardous material alert on building map.' },
  }
  const info = typeMap[emergencyType]
  return {
    id: `INC-${++incCounter}`,
    type: info.type,
    severity: info.severity,
    status: 'New',
    time: nowStr(),
    location: `${floorName} – ${nodeName}`,
    team: info.team,
    nodeId,
    floorId: undefined,
    mapLinked: true,
    description: info.desc,
  }
}

function incidentToTask(incident: Incident): Task {
  return {
    id: `TSK-${++tskCounter}`,
    incidentId: incident.id,
    assignee: incident.team,
    priority: incident.severity === 'critical' ? 'High' : incident.severity === 'high' ? 'High' : incident.severity === 'medium' ? 'Medium' : 'Low',
    status: 'New',
    createdAt: incident.time,
    description: `Respond to ${incident.type} at ${incident.location}`,
  }
}

function incidentToNotification(incident: Incident): Notification {
  const roleMap: Record<string, { user: string; role: string }> = {
    'Fire Dept':    { user: 'Fire Dispatch', role: 'Fire Dept' },
    'Medical Staff':{ user: 'Medical Lead',  role: 'Medical Staff' },
    'Security Team':{ user: 'Sec-Control',   role: 'Security Team' },
    'Hazmat Unit':  { user: 'Hazmat-01',     role: 'Hazmat Unit' },
  }
  const who = roleMap[incident.team] ?? { user: 'System', role: 'Operations' }
  return {
    id: `NTF-${++ntfCounter}`,
    incidentId: incident.id,
    user: who.user,
    role: who.role,
    time: incident.time,
    opened: false,
    ack: false,
    escalated: incident.severity === 'critical',
    message: `[${incident.id}] ${incident.type} at ${incident.location} — ${incident.description}`,
  }
}

// ──────────────────────── Seed data (matches pre-existing mock) ───────────────

const SEED_INCIDENTS: Incident[] = [
  { id: 'INC-2041', type: 'Fire',        severity: 'critical', status: 'In Progress',   time: '10:42 AM', location: 'Sector 3, Floor 2',    team: 'Fire Dept',    mapLinked: false, description: 'Multiple sensors triggered in Floor 2 server room. Auto-suppression disabled.' },
  { id: 'INC-2042', type: 'Medical',     severity: 'high',     status: 'Acknowledged',  time: '10:45 AM', location: 'Lobby Area',            team: 'Medical Staff',mapLinked: false, description: 'Employee reported chest pain in Lobby Area. Response team dispatched.' },
  { id: 'INC-2043', type: 'Security',    severity: 'medium',   status: 'New',           time: '11:05 AM', location: 'North Gate',            team: 'Security Team',mapLinked: false, description: 'Motion detected at North Gate perimeter (Camera 04).' },
  { id: 'INC-2044', type: 'Maintenance', severity: 'low',      status: 'Resolved',      time: '11:15 AM', location: 'Basement HVAC',         team: 'Maintenance',  mapLinked: false, description: 'HVAC unit fault in basement — scheduled maintenance.' },
  { id: 'INC-2045', type: 'IT Offline',  severity: 'low',      status: 'New',           time: '11:30 AM', location: 'Sector 2, Fl 1',        team: 'IT Dept',      mapLinked: false, description: 'Server rack offline – possible power fluctuation.' },
]

const SEED_TASKS: Task[] = [
  { id: 'TSK-091', incidentId: 'INC-2041', assignee: 'T-1 Fire',  priority: 'High',   status: 'In Progress',  createdAt: '10:42 AM', description: 'Respond to Fire at Sector 3, Floor 2' },
  { id: 'TSK-092', incidentId: 'INC-2041', assignee: 'Sec-A1',    priority: 'High',   status: 'New',          createdAt: '10:43 AM', description: 'Secure perimeter of Sector 3' },
  { id: 'TSK-093', incidentId: 'INC-2042', assignee: 'Med-02',    priority: 'Medium', status: 'Acknowledged', createdAt: '10:45 AM', description: 'Assist medical emergency in Lobby Area' },
  { id: 'TSK-094', incidentId: 'INC-2044', assignee: 'J. Smith',  priority: 'Low',    status: 'Resolved',     createdAt: '11:15 AM', description: 'Investigate HVAC fault in basement' },
]

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'NTF-101', incidentId: 'INC-2041', user: 'Admin User',  role: 'Global Admin',  time: '10:42 AM', opened: true,  ack: true,  escalated: false, message: '[INC-2041] Fire at Sector 3, Floor 2 — Multiple sensors triggered.' },
  { id: 'NTF-102', incidentId: 'INC-2041', user: 'T-1 Leader',  role: 'Fire Dept',     time: '10:43 AM', opened: true,  ack: false, escalated: true,  message: '[INC-2041] Fire at Sector 3, Floor 2 — ESCALATED: No ACK from team lead.' },
  { id: 'NTF-103', incidentId: 'INC-2042', user: 'Sec-A1',      role: 'Security Team', time: '10:43 AM', opened: true,  ack: true,  escalated: false, message: '[INC-2042] Medical emergency in Lobby Area — response team informed.' },
  { id: 'NTF-104', incidentId: 'INC-2042', user: 'Dr. L. Evans', role: 'Medical Staff', time: '10:46 AM', opened: false, ack: false, escalated: false, message: '[INC-2042] Medical emergency in Lobby Area — awaiting doctor response.' },
]

// ──────────────────────── Store ───────────────────────────────────────────────

interface IncidentStoreState {
  incidents: Incident[]
  tasks: Task[]
  notifications: Notification[]
  hydrated: boolean
  // Tracking: which map nodeIds we already created incidents for
  mapIncidentNodeIds: Set<string>

  // Actions
  initialize: () => Promise<void>
  addIncident: (inc: Omit<Incident, 'id'> & { id?: string }) => string
  updateIncidentStatus: (id: string, status: IncidentStatus) => void
  addTask: (task: Omit<Task, 'id'> & { id?: string }) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  addNotification: (notif: Omit<Notification, 'id'> & { id?: string }) => void
  acknowledgeNotification: (id: string) => void
  markNotificationRead: (id: string) => void

  /** Called by the map page when an emergency is placed/removed */
  syncFromMap: (emergencyMap: Record<string, EmergencyType>, nodeNames: Record<string, string>, floorNames: Record<string, string>) => void

  /** Derived counts */
  activeCount: () => number
  criticalCount: () => number
  unreadCount: () => number
  pendingTaskCount: () => number
}

export const useIncidentStore = create<IncidentStoreState>((set, get) => ({
  incidents: SEED_INCIDENTS,
  tasks: SEED_TASKS,
  notifications: SEED_NOTIFICATIONS,
  hydrated: false,
  mapIncidentNodeIds: new Set<string>(),

  initialize: async () => {
    if (get().hydrated) return
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const res = await fetch('/api/state', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Failed to fetch shared state: ${res.status}`)
        const data = await res.json()

        const incidents = (data.incidents ?? []) as Incident[]
        const tasks = (data.tasks ?? []) as Task[]
        const notifications = (data.notifications ?? []) as Notification[]

        if (incidents.length > 0 || tasks.length > 0 || notifications.length > 0) {
          syncLocalCounters(incidents, tasks, notifications)
          set({ incidents, tasks, notifications, hydrated: true })
          return
        }

        // Empty DB is still a valid hydrated state.
        set({ hydrated: true })
        return
      } catch (err) {
        if (attempt < 5) {
          console.warn(`Database waking up... Retrying incident fetch (Attempt ${attempt}/5)`)
          await sleep(3500) // Sleep 3.5s to survive the Google Cloud 15s cold starts
          continue
        }
        console.error('Failed to initialize incident store from DB', err)
      }
    }

    // Fallback to local seed data in case DB is not ready yet.
    syncLocalCounters(SEED_INCIDENTS, SEED_TASKS, SEED_NOTIFICATIONS)
    set({ hydrated: true })
  },

  addIncident: (data) => {
    const id = data.id ?? `INC-${++incCounter}`
    const inc: Incident = { ...data, id }
    set(s => ({ incidents: [inc, ...s.incidents] }))
    postJSON('/api/incidents', inc)
    return id
  },

  updateIncidentStatus: (id, status) => {
    set(s => ({ incidents: s.incidents.map(i => i.id === id ? { ...i, status } : i) }))
    patchJSON(`/api/incidents/${id}/status`, { status })
  },

  addTask: (data) => {
    const id = data.id ?? `TSK-${++tskCounter}`
    const task: Task = { ...data, id }
    set(s => ({ tasks: [task, ...s.tasks] }))
    postJSON('/api/tasks', task)
  },

  updateTaskStatus: (id, status) => {
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t) }))
    patchJSON(`/api/tasks/${id}/status`, { status })
  },

  addNotification: (data) => {
    const id = data.id ?? `NTF-${++ntfCounter}`
    const notification: Notification = { ...data, id }
    set(s => ({ notifications: [notification, ...s.notifications] }))
    postJSON('/api/notifications', notification)
  },

  acknowledgeNotification: (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, ack: true, opened: true } : n) }))
    patchJSON(`/api/notifications/${id}/ack`)
  },

  markNotificationRead: (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, opened: true } : n) }))
    patchJSON(`/api/notifications/${id}/read`)
  },

  syncFromMap: (emergencyMap, nodeNames, floorNames) => {
    const state = get()
    const existing = new Set(state.mapIncidentNodeIds)
    const newNodeIds: string[] = []

    // Add incidents for new emergency nodes
    for (const [nodeId, emergencyType] of Object.entries(emergencyMap)) {
      if (existing.has(nodeId)) continue
      existing.add(nodeId)
      newNodeIds.push(nodeId)

      const nodeName = nodeNames[nodeId] ?? nodeId
      const floorName = floorNames[nodeId] ?? 'Unknown Floor'
      const incident = emergencyToIncident(nodeId, nodeName, floorName, emergencyType)
      const task = incidentToTask(incident)
      const notif = incidentToNotification(incident)

      set(s => ({
        incidents: [incident, ...s.incidents],
        tasks: [task, ...s.tasks],
        notifications: [notif, ...s.notifications],
      }))
      postJSON('/api/incidents', incident)
      postJSON('/api/tasks', task)
      postJSON('/api/notifications', notif)
    }

    // Resolve incidents for removed emergency nodes
    const currentNodeIds = new Set(Object.keys(emergencyMap))
    for (const nodeId of existing) {
      if (!currentNodeIds.has(nodeId)) {
        existing.delete(nodeId)
        // Auto-resolve the linked incident
        set(s => ({
          incidents: s.incidents.map(i =>
            i.nodeId === nodeId && i.status !== 'Resolved' ? { ...i, status: 'Resolved' } : i
          ),
          tasks: s.tasks.map(t => {
            const linked = s.incidents.find(i => i.nodeId === nodeId)
            if (linked && t.incidentId === linked.id && t.status !== 'Resolved') return { ...t, status: 'Resolved' }
            return t
          }),
        }))
        const linked = state.incidents.find(i => i.nodeId === nodeId)
        if (linked) {
          patchJSON(`/api/incidents/${linked.id}/status`, { status: 'Resolved' })
          state.tasks
            .filter(t => t.incidentId === linked.id && t.status !== 'Resolved')
            .forEach(t => patchJSON(`/api/tasks/${t.id}/status`, { status: 'Resolved' }))
        }
      }
    }

    set({ mapIncidentNodeIds: existing })
  },

  activeCount: () => get().incidents.filter(i => i.status !== 'Resolved').length,
  criticalCount: () => get().incidents.filter(i => i.severity === 'critical' && i.status !== 'Resolved').length,
  unreadCount: () => get().notifications.filter(n => !n.opened).length,
  pendingTaskCount: () => get().tasks.filter(t => t.status !== 'Resolved').length,
}))
