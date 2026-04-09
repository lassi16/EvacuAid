"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquareText, X, Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type MessageRole = "assistant" | "user"

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [inputVal, setInputVal] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      role: "assistant",
      content: "Hello! I am EvacuAid's safety AI. How can I assist you with building safety or evacuation protocols today?"
    }
  ])
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom every time a message is added
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fake AI Responder Matrix (for Demo)
  const generateMockResponse = (query: string) => {
    const q = query.toLowerCase()
    
    // Quick artificial delays to simulate LLM thinking
    setIsTyping(true)
    setTimeout(() => {
      let response = "I don't have enough data on that. I recommend proceeding to the nearest safe stairwell and ignoring elevators."
      
      if (q.includes("stairwell") || q.includes("exit")) {
        response = "The nearest safe stairwell is the West Stairwell. Do NOT take the East Stairwell; sensors indicate high thermal signatures."
      } else if (q.includes("trapped") || q.includes("help") || q.includes("stuck")) {
        response = "I have automatically pinged your location to the Medical and Fire dispatch units. Please stay low to the ground and barricade the door if smoke is entering."
      } else if (q.includes("map") || q.includes("where")) {
        response = "You can view dynamic real-time evacuation routes on the Building Map tab located in the left sidebar."
      } else if (q.includes("extinguisher")) {
        response = "There is a Class A fire extinguisher located exactly 15 feet down the Central Corridor on Floor 3."
      }
      
      setMessages(prev => [...prev, { id: `msg-${Date.now()}`, role: "assistant", content: response }])
      setIsTyping(false)
    }, 1200)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return
    
    // Add user message
    setMessages(prev => [...prev, { id: `usr-${Date.now()}`, role: "user", content: text }])
    setInputVal("")
    
    // Trigger mock AI response
    generateMockResponse(text)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Panel Form */}
      {isOpen && (
        <div 
          className="mb-4 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-300 ease-out origin-bottom-right"
          style={{ animation: 'bounce-fade-up 0.2s ease-out forwards' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">EvacuAid AI</h3>
                <p className="text-[10px] text-sky-100 uppercase tracking-widest font-medium">Assistant Node Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-sky-100 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroller */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={cn(
                  "flex gap-3",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                  m.role === "user" ? "bg-slate-200 text-slate-500" : "bg-sky-100 text-sky-600"
                )}>
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm",
                  m.role === "user" 
                    ? "bg-slate-800 text-white rounded-tr-none" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm bg-sky-100 text-sky-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="px-4 py-2 bg-slate-50 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 shrink-0">
            {[
              "Where is the nearest safe stairwell?",
              "Someone is trapped.",
              "Show me the map."
            ].map(qr => (
              <button 
                key={qr}
                onClick={() => handleSend(qr)}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:text-sky-600 hover:border-sky-300 shadow-sm transition-colors"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full p-1 pr-1.5 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400 transition-all">
              <input
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend(inputVal)
                }}
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-800 outline-none"
                placeholder="Ask me anything..."
              />
              <button 
                onClick={() => handleSend(inputVal)}
                disabled={!inputVal.trim() || isTyping}
                className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Launcher Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300",
          isOpen ? "bg-slate-800 text-white hover:bg-slate-900" : "bg-sky-600 text-white hover:bg-sky-700 hover:scale-105"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-fade-up {
          0% { transform: translateY(10px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
