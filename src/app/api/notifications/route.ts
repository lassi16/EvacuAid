import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const required = ["id", "incidentId", "user", "role", "time", "message"]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    const notification = await prisma.notification.upsert({
      where: { id: body.id },
      update: {
        incidentId: body.incidentId,
        user: body.user,
        role: body.role,
        time: body.time,
        opened: Boolean(body.opened),
        ack: Boolean(body.ack),
        escalated: Boolean(body.escalated),
        message: body.message,
      },
      create: {
        id: body.id,
        incidentId: body.incidentId,
        user: body.user,
        role: body.role,
        time: body.time,
        opened: Boolean(body.opened),
        ack: Boolean(body.ack),
        escalated: Boolean(body.escalated),
        message: body.message,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Failed to upsert notification", error)
    return NextResponse.json({ error: "Failed to persist notification" }, { status: 500 })
  }
}
