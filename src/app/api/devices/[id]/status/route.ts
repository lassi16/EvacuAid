import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, context: any) {
  try {
    const { id } = context.params
    const body = await request.json()
    const { status, battery } = body

    const device = await prisma.device.update({
      where: { id },
      data: {
        status,
        ...(battery !== undefined ? { battery } : {}),
        lastPing: 'Just now'
      }
    })

    return NextResponse.json(device)
  } catch (error) {
    console.error(`Failed to update device ${context.params.id}:`, error)
    return NextResponse.json({ error: 'Failed to update device status' }, { status: 500 })
  }
}
