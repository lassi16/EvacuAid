import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [incidents, tasks, notifications] = await Promise.all([
      prisma.incident.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.task.findMany({ orderBy: { insertedAt: "desc" } }),
      prisma.notification.findMany({ orderBy: { insertedAt: "desc" } }),
    ])

    return NextResponse.json({ incidents, tasks, notifications })
  } catch (error) {
    console.error("Failed to fetch shared state", error)
    return NextResponse.json({ error: "Failed to load shared state" }, { status: 500 })
  }
}
