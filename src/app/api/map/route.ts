import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAP_ID = "global_evacuaid_map_v1"

export async function GET() {
  try {
    const mapDoc = await prisma.buildingMap.findUnique({
      where: { id: MAP_ID }
    })

    if (!mapDoc) {
      return NextResponse.json({ error: 'Map not initialized' }, { status: 404 })
    }

    return NextResponse.json(mapDoc.jsonData)
  } catch (error) {
    console.error('Failed to fetch building map:', error)
    return NextResponse.json({ error: 'Failed to fetch building map' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const building = await request.json()
    
    await prisma.buildingMap.upsert({
      where: { id: MAP_ID },
      update: { name: building.name, jsonData: building },
      create: { id: MAP_ID, name: building.name, jsonData: building }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save building map:', error)
    return NextResponse.json({ error: 'Failed to save building map' }, { status: 500 })
  }
}
