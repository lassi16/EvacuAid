import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await req.json()

    if (!body.status) {
      return NextResponse.json({ error: "Missing field: status" }, { status: 400 })
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status: body.status },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Failed to update task status", error)
    return NextResponse.json({ error: "Failed to update task status" }, { status: 500 })
  }
}
