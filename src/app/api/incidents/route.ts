import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const required = ["id", "type", "severity", "status", "time", "location", "team"]
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 })
      }
    }

    const incident = await prisma.incident.upsert({
      where: { id: body.id },
      update: {
        type: body.type,
        severity: body.severity,
        status: body.status,
        time: body.time,
        location: body.location,
        team: body.team,
        nodeId: body.nodeId ?? null,
        floorId: body.floorId ?? null,
        mapLinked: Boolean(body.mapLinked),
        description: body.description ?? null,
      },
      create: {
        id: body.id,
        type: body.type,
        severity: body.severity,
        status: body.status,
        time: body.time,
        location: body.location,
        team: body.team,
        nodeId: body.nodeId ?? null,
        floorId: body.floorId ?? null,
        mapLinked: Boolean(body.mapLinked),
        description: body.description ?? null,
      },
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    console.error("Failed to upsert incident", error)
    return NextResponse.json({ error: "Failed to persist incident" }, { status: 500 })
  }
}
