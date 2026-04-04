"use client"

import { useParams } from "next/navigation"
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users, 
  ShieldAlert,
  Flame,
  BrainCircuit,
  Camera,
  MessageSquare,
  FileCheck,
  ChevronDown,
  Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function IncidentDetailPage() {
  const params = useParams()
  // Ensure params.id is treated as a string, handling both string and string[] cases safely.
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const idToUse = idStr || 'INC-2041';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-brand-red/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{idToUse}</h1>
            <Badge variant="destructive" className="animate-pulse shadow-lg shadow-red-900/50">CRITICAL</Badge>
            <Badge variant="outline" className="border-brand-red text-brand-red bg-brand-red/10">Fire Protocol Active</Badge>
          </div>
          <p className="text-slate-500 text-lg flex items-center gap-2">
            <Flame className="h-5 w-5 text-brand-red" />
            Confirmed Server Room Fire
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-slate-900 border-slate-200">Acknowledge</Button>
          <Button variant="secondary" className="bg-slate-100">Assign Responder</Button>
          <div className="relative">
            <Button variant="default" className="bg-brand-red hover:bg-red-600 shadow-lg shadow-red-900/20 w-32 justify-between">
              Update Status <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-1">Time Detected</span>
                  <div className="flex items-center gap-2 text-slate-900 font-mono">
                    <Clock className="h-4 w-4 text-slate-500" />
                    10:42:11 AM
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-1">Location</span>
                  <div className="flex items-center gap-2 text-slate-900 font-mono">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    Sector 3, Fl 2
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-1">Assigned Unit</span>
                  <div className="flex items-center gap-2 text-slate-900 font-mono">
                    <Users className="h-4 w-4 text-slate-500" />
                    Fire Dept (T-1)
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-xs block mb-1">Escalation in</span>
                  <div className="flex items-center gap-2 text-brand-red font-mono font-bold animate-pulse">
                    <Activity className="h-4 w-4" />
                    01:45
                  </div>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Primary smoke sensor (ID: SM-3B) triggered in Sector 3, Floor 2 Server Room. 
                Secondary heat sensors indicate rapid temperature rise from 22°C to 45°C within 30 seconds. 
                Auto-suppression system currently in standby pending human override.
              </p>
            </CardContent>
          </Card>

          <Card className="border-sky-200 bg-sky-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sky-600">
                <BrainCircuit className="h-5 w-5" /> AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/3 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-sky-500 text-sky-600 text-2xl font-bold bg-white shadow-sm">
                    98%
                  </div>
                  <p className="text-xs text-sky-600/80 mt-2">Confidence Score</p>
                </div>
                <div className="w-full md:w-2/3 space-y-3">
                  <div className="bg-white p-3 rounded border border-sky-200">
                    <p className="text-sm text-slate-600"><span className="text-sky-600 font-semibold">Priority Action:</span> Dispatch heavy suppression team. Recommend immediate evacuation of Sector 3.</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="border-slate-200 bg-slate-50/80">Sensor Correlation: High</Badge>
                    <Badge variant="outline" className="border-slate-200 bg-slate-50/80">False Pos Prob: &lt; 2%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">SYS</div>
                <div className="flex-1 bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-sky-600">System Auto-Dispatch</span>
                    <span className="text-xs text-slate-500 font-mono">10:42 PM</span>
                  </div>
                  <p className="text-sm text-slate-600">Automated protocols engaged. Security Team Alpha notified for visual confirmation.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-700">SA</div>
                <div className="flex-1 bg-slate-50/50 rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm text-yellow-500">Security Alpha</span>
                    <span className="text-xs text-slate-500 font-mono">10:44 PM</span>
                  </div>
                  <p className="text-sm text-slate-600">Visual confirmed from Cam-05. Smoke visible from server room door gap.</p>
                </div>
              </div>
              <div className="flex gap-4 relative">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <textarea 
                    className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 min-h-[80px]"
                    placeholder="Type dispatch instructions..."
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white">Send Message</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Media & Responders */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Evidence Media</span>
                <Camera className="h-4 w-4 text-slate-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-slate-900 rounded-lg border border-slate-200 relative overflow-hidden group">
                {/* Mock thermal camera feed */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 via-red-500 to-yellow-400 opacity-60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] object-cover origin-center opacity-30" />
                
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-[10px] font-mono text-white flex gap-2">
                  <span className="text-red-500 flex items-center gap-1 animate-pulse"><span className="w-2 h-2 rounded-full bg-red-500"></span>REC</span>
                  <span>CAM-05 (THERMAL)</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <Button variant="secondary" size="sm">Expand Feed</Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="aspect-video bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">Sensor Log</div>
                <div className="aspect-video bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">Floorplan Node</div>
                <div className="aspect-video bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-[10px] text-slate-500">+ Upload</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Response Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center space-x-3 text-sm p-2 rounded hover:bg-slate-100/50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white" defaultChecked />
                <span className="text-slate-600 line-through">Acknowledge Alert</span>
              </label>
              <label className="flex items-center space-x-3 text-sm p-2 rounded hover:bg-slate-100/50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white" defaultChecked />
                <span className="text-slate-600 line-through">Dispatch Security Assessment</span>
              </label>
              <label className="flex items-center space-x-3 text-sm p-2 bg-red-50 border border-red-200 rounded cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-red-500 bg-white text-red-600 focus:ring-red-500 focus:ring-offset-white group-hover:border-red-500" />
                <span className="text-red-600 font-bold">Evacuate Sector 3</span>
              </label>
              <label className="flex items-center space-x-3 text-sm p-2 rounded hover:bg-slate-100/50 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white" />
                <span className="text-slate-500">Trigger Halon Suppression</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
