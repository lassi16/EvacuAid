import Link from "next/link"
import { ShieldAlert, ArrowRight, Activity, BrainCircuit, Users, Lock, ChevronRight, CheckCircle2, ChevronDown, Zap, Server, MapPin } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-200">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold tracking-widest text-slate-900">EvacuAid</span>
            <span className="ml-2 text-xs font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Solution Challenge '26</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#problem" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">The Problem</Link>
            <Link href="#architecture" className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors">Tech Stack</Link>
            <Link href="/dashboard" className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-sky-600 transition-colors flex items-center gap-2">
              Launch MVP <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold uppercase tracking-widest mb-6">
            <BrainCircuit className="h-4 w-4" /> Powered natively by Google Gemini
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 drop-shadow-sm">
            Autonomous <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Crisis Response</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Static emergency maps are lethal when fire blocks the primary exit. EvacuAid leverages ML IoT Sensors, YOLOv8 Vision, and generative AI to instantly recalculate escape vectors and blast instructions to trapped occupants.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard" className="bg-gradient-to-r from-sky-600 to-blue-600 shadow-lg shadow-sky-200 text-white px-8 py-3.5 rounded-full font-bold text-lg hover:scale-105 hover:shadow-sky-300 transition-all flex items-center gap-2">
              Command Dashboard Demo <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="#architecture" className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-full font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition-all">
              View Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem & USP */}
      <section id="problem" className="py-24 bg-white px-6 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Why EvacuAid? (Our USP)</h2>
            <div className="w-20 h-1 bg-red-400 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6"><Activity className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">The Problem</h3>
              <p className="text-slate-600 leading-relaxed">During structural emergencies, standard evacuation maps lead humans blindly into hazardous corridors if the fire originates there. Panic makes coordination impossible.</p>
            </div>
            
            <div className="bg-sky-50 p-8 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="w-12 h-12 bg-sky-200 rounded-xl flex items-center justify-center text-sky-700 mb-6"><BrainCircuit className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Our Solution (USP)</h3>
              <p className="text-slate-700 leading-relaxed font-medium">We replaced the static map with a live A* routing engine. If an IoT Sensor detects smoke, the node dies, and the Map recalculates the shortest survivable exit in 3 milliseconds.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6"><Users className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Autonomous Dispatch</h3>
              <p className="text-slate-600 leading-relaxed">No human intervention required. IsolationForest ML detects anomalies, flags the severity, and autogenerates a payload to automatically dispatch emergency responders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Architecture mapping */}
      <section id="architecture" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Architecture & Tech Stack</h2>
                <p className="text-slate-400 text-lg leading-relaxed">The EvacuAid prototype is completely functional. It uses a decoupled modern architecture bridging a high-performance React UI with a deep-learning Python backend.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg"><Zap className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-bold text-white">Frontend: Next.js + Zustand + Canvas</h4>
                    <p className="text-sm text-slate-400">High-FPS Graph mapping via HTML5 Canvas API.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <div className="p-3 bg-green-500/20 text-green-400 rounded-lg"><Server className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-bold text-white">Backend: Python FastAPI + Scikit</h4>
                    <p className="text-sm text-slate-400">YOLOv8 vision models & IsolationForest time-series anomaly detection.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-sky-900/30 p-4 rounded-xl border border-sky-500/30">
                  <div className="p-3 bg-sky-500/20 text-sky-400 rounded-lg"><BrainCircuit className="h-6 w-6" /></div>
                  <div>
                    <h4 className="font-bold text-sky-100">Google Gemini Pro (Cloud + GenAI)</h4>
                    <p className="text-sm text-sky-200">The application natively taps into Gemini RAG flows to act as the autonomous dispatch and conversational safety agent.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500 opacity-10 blur-3xl" />
               <div className="space-y-6 relative z-10 font-mono text-sm">
                  <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                    <span className="text-emerald-400">1. IoT Sensor (Temp/Smoke)</span>
                    <span className="text-slate-500">→</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border-l-4 border-l-sky-500 shadow-lg shadow-sky-500/10">
                    <span className="text-sky-400">2. Python Engine (Isolation Forest ML)</span>
                    <span className="text-slate-500">→</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border border-slate-700">
                    <span className="text-amber-400">3. A* Map Engine Recalculates Route</span>
                    <span className="text-slate-500">→</span>
                  </div>
                  <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-between border-l-4 border-l-purple-500">
                    <span className="text-purple-400">4. Google Gemini NLP Alerts Responder</span>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-white border-t border-slate-200 text-center">
        <p className="text-slate-500 font-medium tracking-wide">EvacuAid © 2026</p>
        <p className="text-slate-400 text-sm mt-2">Built for the Google Solution Challenge</p>
      </footer>

    </div>
  )
}
