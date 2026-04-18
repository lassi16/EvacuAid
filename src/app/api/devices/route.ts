import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { id: 'asc' }
    })
    return NextResponse.json(devices)
  } catch (error) {
    console.error('Failed to fetch devices:', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}
