import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { DEFAULT_BUILDING } from "../src/lib/routing/graph/hotelExample"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  const incidents = [
    { id: "INC-2041", type: "Fire", severity: "critical", status: "In Progress", time: "10:42 AM", location: "Sector 3, Floor 2", team: "Fire Dept", mapLinked: false, description: "Multiple sensors triggered in Floor 2 server room. Auto-suppression disabled." },
    { id: "INC-2042", type: "Medical", severity: "high", status: "Acknowledged", time: "10:45 AM", location: "Lobby Area", team: "Medical Staff", mapLinked: false, description: "Employee reported chest pain in Lobby Area. Response team dispatched." },
    { id: "INC-2043", type: "Security", severity: "medium", status: "New", time: "11:05 AM", location: "North Gate", team: "Security Team", mapLinked: false, description: "Motion detected at North Gate perimeter (Camera 04)." },
    { id: "INC-2044", type: "Maintenance", severity: "low", status: "Resolved", time: "11:15 AM", location: "Basement HVAC", team: "Maintenance", mapLinked: false, description: "HVAC unit fault in basement - scheduled maintenance." },
    { id: "INC-2045", type: "IT Offline", severity: "low", status: "New", time: "11:30 AM", location: "Sector 2, Fl 1", team: "IT Dept", mapLinked: false, description: "Server rack offline - possible power fluctuation." },
  ]

  for (const incident of incidents) {
    await prisma.incident.upsert({
      where: { id: incident.id },
      update: incident,
      create: incident,
    })
  }

  const tasks = [
    { id: "TSK-091", incidentId: "INC-2041", assignee: "T-1 Fire", priority: "High", status: "In Progress", createdAt: "10:42 AM", description: "Respond to Fire at Sector 3, Floor 2" },
    { id: "TSK-092", incidentId: "INC-2041", assignee: "Sec-A1", priority: "High", status: "New", createdAt: "10:43 AM", description: "Secure perimeter of Sector 3" },
    { id: "TSK-093", incidentId: "INC-2042", assignee: "Med-02", priority: "Medium", status: "Acknowledged", createdAt: "10:45 AM", description: "Assist medical emergency in Lobby Area" },
    { id: "TSK-094", incidentId: "INC-2044", assignee: "J. Smith", priority: "Low", status: "Resolved", createdAt: "11:15 AM", description: "Investigate HVAC fault in basement" },
  ]

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: task,
      create: task,
    })
  }

  const notifications = [
    { id: "NTF-101", incidentId: "INC-2041", user: "Admin User", role: "Global Admin", time: "10:42 AM", opened: true, ack: true, escalated: false, message: "[INC-2041] Fire at Sector 3, Floor 2 - Multiple sensors triggered." },
    { id: "NTF-102", incidentId: "INC-2041", user: "T-1 Leader", role: "Fire Dept", time: "10:43 AM", opened: true, ack: false, escalated: true, message: "[INC-2041] Fire at Sector 3, Floor 2 - ESCALATED: No ACK from team lead." },
    { id: "NTF-103", incidentId: "INC-2042", user: "Sec-A1", role: "Security Team", time: "10:43 AM", opened: true, ack: true, escalated: false, message: "[INC-2042] Medical emergency in Lobby Area - response team informed." },
    { id: "NTF-104", incidentId: "INC-2042", user: "Dr. L. Evans", role: "Medical Staff", time: "10:46 AM", opened: false, ack: false, escalated: false, message: "[INC-2042] Medical emergency in Lobby Area - awaiting doctor response." },
  ]

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: notification,
      create: notification,
    })
  }

  // --- Devices ---
  const SEED_DEVICES = [
    { id: 'DEV-C10', name: 'Lobby Cam 01', type: 'cctv', location: 'Main Lobby', status: 'online', lastPing: 'Just now', feedUrl: '/cctv/lobby_1775397097334.png' },
    { id: 'DEV-C11', name: 'Corridor Cam North', type: 'cctv', location: 'Floor 2 - North', status: 'online', lastPing: 'Just now', feedUrl: '/cctv/corridor_1775397112677.png' },
    { id: 'DEV-C12', name: 'Server Room Cam', type: 'cctv', location: 'Floor 1 - Server Room', status: 'online', lastPing: '1m ago', feedUrl: '/cctv/server_room_1775397130770.png' },
    { id: 'DEV-C13', name: 'Basement Cam 02', type: 'cctv', location: 'Basement Parking', status: 'offline', lastPing: '14h ago' },
    { id: 'DEV-S01', name: 'Smoke Detector A1', type: 'smoke', location: 'Sector 3, Floor 2', status: 'alert', lastPing: 'Just now', battery: 85 },
    { id: 'DEV-S02', name: 'Smoke Detector A2', type: 'smoke', location: 'Sector 3, Floor 2', status: 'alert', lastPing: 'Just now', battery: 82 },
    { id: 'DEV-S03', name: 'Smoke Detector B1', type: 'smoke', location: 'Lobby Area', status: 'online', lastPing: '5m ago', battery: 96 },
    { id: 'DEV-F01', name: 'Fire Sensor N-2', type: 'fire', location: 'Corridor North, Fl 3', status: 'online', lastPing: '2m ago', battery: 100 },
    { id: 'DEV-F02', name: 'Fire Sensor S-1', type: 'fire', location: 'Cafeteria Kitchen', status: 'maintenance', lastPing: '2d ago', battery: 12 },
    { id: 'DEV-D01', name: 'Smart Door Entry', type: 'door', location: 'Main Entry', status: 'online', lastPing: 'Just now' },
    { id: 'DEV-D02', name: 'Server Secure Lock', type: 'access', location: 'Floor 1 - Server Room', status: 'online', lastPing: 'Just now' },
    { id: 'DEV-D03', name: 'Roof Access Lock', type: 'access', location: 'Roof Stairwell', status: 'offline', lastPing: '3h ago', battery: 0 },
  ]
  
  for (const device of SEED_DEVICES) {
    await prisma.device.upsert({
      where: { id: device.id },
      update: device,
      create: device,
    })
  }

  // --- Building Map JSON ---
  const mapId = "global_evacuaid_map_v1"
  await prisma.buildingMap.upsert({
    where: { id: mapId },
    update: { name: DEFAULT_BUILDING.name, jsonData: DEFAULT_BUILDING as any },
    create: { id: mapId, name: DEFAULT_BUILDING.name, jsonData: DEFAULT_BUILDING as any },
  })

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error("Seed failed", error)
    await prisma.$disconnect()
    process.exit(1)
  })
