import "dotenv/config"
import { GoogleGenerativeAI } from "@google/generative-ai"

async function run() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("No API key")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: "You are EvacuAid"
  })

  const chat = model.startChat({
    history: [{ role: "user", parts: [{ text: "hi" }] }]
  })

  const result = await chat.sendMessage("hello")
  console.log(result.response.text())
}

run().catch(console.error)
