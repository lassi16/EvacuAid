'use client'

import { create } from 'zustand'
import { useIncidentStore } from './incidentStore'

// ──────────────────────── Types ────────────────────────

export type DeviceType = 'cctv' | 'smoke' | 'fire' | 'door' | 'access'
export type DeviceStatus = 'online' | 'offline' | 'alert' | 'maintenance'

export interface IoTDevice {
  id: string
  name: string
  type: DeviceType
  location: string
  status: DeviceStatus
  lastPing: string
  battery?: number // 0-100 for wireless sensors
  feedUrl?: string // For CCTV mock images
}

// Hardcoded mock data has been moved to prisma/seed.ts and Cloud SQL

// ──────────────────────── Store ────────────────────────

interface DeviceStoreState {
  devices: IoTDevice[]
  hydrated: boolean

  initialize: (retryCount?: number) => Promise<void>
  updateDeviceStatus: (id: string, status: DeviceStatus) => Promise<void>
  rebootDevice: (id: string) => Promise<void>
  simulateAlert: (id: string) => Promise<void>
}

// Helper
function nowStr() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export const useDeviceStore = create<DeviceStoreState>((set, get) => ({
  devices: [],
  hydrated: false,

  initialize: async (retryCount = 0) => {
    try {
      const res = await fetch('/api/devices')
      if (res.ok) {
        const devices = await res.json()
        set({ devices, hydrated: true })
      } else if (res.status === 500 && retryCount < 3) {
        // Handle Google Cloud SQL cold-start timeouts
        console.warn('Database waking up, retrying device fetch...')
        setTimeout(() => get().initialize(retryCount + 1), 3000)
      }
    } catch (e) {
      console.error('Failed to hydrate device store', e)
    }
  },

  updateDeviceStatus: async (id, status) => {
    // Optimistic UI update
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status, lastPing: 'Just now' } : d)
    }))
    
    await fetch(`/api/devices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
  },

  rebootDevice: async (id) => {
    // 1. Set offline locally and in DB
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status: 'offline' } : d)
    }))
    await fetch(`/api/devices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'offline' })
    })

    // 2. Simulate booting up after 3 seconds
    setTimeout(async () => {
      set(state => ({
        devices: state.devices.map(d => d.id === id ? { ...d, status: 'online', lastPing: 'Just now', battery: d.battery !== undefined ? 100 : undefined } : d)
      }))
      await fetch(`/api/devices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'online', battery: 100 })
      })
    }, 3000)
  },

  simulateAlert: async (id) => {
    const devices = get().devices
    const device = devices.find(d => d.id === id)
    if (!device) return

    // 1. Set local device to Alert and update backend
    set(state => ({
      devices: state.devices.map(d => d.id === id ? { ...d, status: 'alert', lastPing: 'Just now' } : d)
    }))
    await fetch(`/api/devices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'alert' })
    })

    // 2. Trigger global incident
    let type = 'System Alert'
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'
    let team = 'Maintenance'
    
    if (device.type === 'smoke') { type = 'Smoke'; severity = 'high'; team = 'Fire Dept' }
    if (device.type === 'fire')  { type = 'Fire'; severity = 'critical'; team = 'Fire Dept' }
    if (device.type === 'cctv')  { type = 'Security'; severity = 'medium'; team = 'Security Team' }
    if (device.type === 'door' || device.type === 'access') { type = 'Breach'; severity = 'high'; team = 'Security Team' }

    // Use the existing Incident Store directly
    const incidentStore = useIncidentStore.getState()
    const incId = incidentStore.addIncident({
      type,
      severity,
      status: 'New',
      time: nowStr(),
      location: device.location,
      team,
      mapLinked: false,
      description: `Manual test diagnostic triggered a systemic alert from ${device.name} [${device.id}].`
    })

    // Create Tasks and Notifications
    incidentStore.addTask({
      incidentId: incId,
      assignee: team,
      priority: severity === 'critical' ? 'High' : severity === 'high' ? 'High' : 'Medium',
      status: 'New',
      createdAt: nowStr(),
      description: `Investigate triggered ${device.type.toUpperCase()} sensor at ${device.location}`
    })

    incidentStore.addNotification({
      incidentId: incId,
      user: 'IoT Gateway',
      role: 'System',
      time: nowStr(),
      opened: false,
      ack: false,
      escalated: severity === 'critical',
      message: `[${incId}] ALARM Triggered by ${device.name} at ${device.location}. Automatically dispatched to ${team}.`
    })
  }

}))
