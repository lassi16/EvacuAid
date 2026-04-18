import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 })
    }

    const body = await request.json()
    const { messages } = body
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array required' }, { status: 400 })
    }

    // 1. Fetch live God-Mode Context from Cloud SQL (with retry logic for DB hibernation)
    let dbData: any = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        dbData = await Promise.all([
          prisma.incident.findMany({ orderBy: { createdAt: 'desc' } }),
          prisma.task.findMany({ orderBy: { insertedAt: 'desc' } }),
          prisma.notification.findMany({ orderBy: { insertedAt: 'desc' } }),
          prisma.device.findMany(),
          prisma.buildingMap.findUnique({ where: { id: "global_evacuaid_map_v1" } })
        ])
        break; // Sucesss
      } catch (dbError: any) {
        if (dbError.code === 'P1001') {
          attempts++;
          await new Promise(r => setTimeout(r, 3500)); // sleep 3.5s for Cold Start
        } else {
          throw dbError;
        }
      }
    }

    if (!dbData) throw new Error("Database failed to wake up after 10 seconds.");

    const [incidents, tasks, notifications, devices, mapDoc] = dbData;

    // Format Map nodes minimally to give geometry context without blowing up token limit
    const buildingInfo = mapDoc?.jsonData ? (mapDoc.jsonData as any) : null
    let mapSummary = "No internal map data populated."
    if (buildingInfo?.floors) {
      mapSummary = buildingInfo.floors.map((f: any) => {
        return `Floor ${f.name} Nodes: ` + f.nodes.map((n: any) => `${n.label} (${n.type})`).join(", ")
      }).join("\n")
    }

    const systemPrompt = `
You are the EvacuAid AI Command Node. You are a highly professional, direct, and authoritative emergency crisis intelligence system.
Your priority is life safety, building navigation, and situational awareness. 

Here is the LIVE real-time state of the building pulled directly from Cloud SQL:

--- ACTIVE INCIDENTS ---
${JSON.stringify(incidents.filter((i: any) => i.status !== 'Resolved'), null, 2)}

--- DEPLOYED TASKS ---
${JSON.stringify(tasks.filter((t: any) => t.status !== 'Resolved'), null, 2)}

--- IOT SENSORS & DEVICES ---
${JSON.stringify(devices, null, 2)}

--- BUILDING GEOMETRY (FLOORS & ROOMS) ---
${mapSummary}

INSTRUCTIONS:
1. When asked about emergencies, reference the "ACTIVE INCIDENTS" and "IOT SENSORS" securely.
2. If asked about routes, reference the "BUILDING GEOMETRY".
3. Be concise. Do not use filler words. State the facts clearly and calmly.
4. If a sensor is offline or has low battery, advise maintenance or extreme caution.
5. If there is a fire/smoke emergency, definitively instruct users to AVOID the specified floor/node.
`

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt 
    })

    // Format history for Gemini
    let formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Gemini constraint: A multi-turn conversation MUST start with a 'user' message.
    // If the first message is our mock widget greeting ('model'), trim it out.
    if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift()
    }

    const chat = model.startChat({
      history: formattedHistory
    })

    const lastMessage = messages[messages.length - 1].content

    // Execute completion
    const result = await chat.sendMessage(lastMessage)
    const responseText = result.response.text()

    return NextResponse.json({ response: responseText })
    
  } catch (error: any) {
    console.error('AI Chat Error HTTP Exception:', error)
    return NextResponse.json({ error: 'AI processing failed', details: error.message }, { status: 500 })
  }
}
