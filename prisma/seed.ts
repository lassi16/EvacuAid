import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
const prisma = new PrismaClient({ adapter })

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
