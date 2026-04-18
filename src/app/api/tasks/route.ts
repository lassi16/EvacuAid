import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const required = ["id", "incidentId", "assignee", "priority", "status", "createdAt"]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    const task = await prisma.task.upsert({
      where: { id: body.id },
      update: {
        incidentId: body.incidentId,
        assignee: body.assignee,
        priority: body.priority,
        status: body.status,
        createdAt: body.createdAt,
        description: body.description ?? null,
      },
      create: {
        id: body.id,
        incidentId: body.incidentId,
        assignee: body.assignee,
        priority: body.priority,
        status: body.status,
        createdAt: body.createdAt,
        description: body.description ?? null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Failed to upsert task", error)
    return NextResponse.json({ error: "Failed to persist task" }, { status: 500 })
  }
}
