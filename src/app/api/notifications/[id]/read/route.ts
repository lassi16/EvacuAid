import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const notification = await prisma.notification.update({
      where: { id },
      data: { opened: true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to mark notification read", error)
    return NextResponse.json({ error: "Failed to mark notification read" }, { status: 500 })
  }
}
