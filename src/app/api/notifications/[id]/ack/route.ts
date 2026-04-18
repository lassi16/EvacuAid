import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const notification = await prisma.notification.update({
      where: { id },
      data: { ack: true, opened: true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to acknowledge notification", error)
    return NextResponse.json({ error: "Failed to acknowledge notification" }, { status: 500 })
  }
}
