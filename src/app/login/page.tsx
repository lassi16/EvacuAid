import { ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500 opacity-[0.1] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500 opacity-[0.1] blur-3xl rounded-full pointer-events-none" />
      
      <div className="text-center mb-8 z-10">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-lg">
            <ShieldAlert className="h-8 w-8 text-sky-600 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Emergency Command Center</h1>
        <p className="text-slate-500">EvacuAid Secure Access Gateway</p>
      </div>

      <Card className="w-full max-w-md z-10 border-slate-200 bg-white/80 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your credentials to access the command dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email or ID Number
            </label>
            <input
              id="email"
              type="email"
              placeholder="operator@evacuaid.local"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Link href="#" className="text-xs text-sky-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <div className="space-y-2 pt-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-700">
              Select Role (Simulation)
            </label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="admin">Global Administrator</option>
              <option value="reception">Front Desk / Reception</option>
              <option value="security">Security Team Lead</option>
              <option value="medical">Medical Responder</option>
              <option value="fire">Fire & Maintenance</option>
            </select>
          </div>
          
          <div className="space-y-2 pt-2">
            <label htmlFor="building" className="text-sm font-medium text-slate-700">
              Building Selection
            </label>
            <select
              id="building"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="hq">Headquarters (Sector 1)</option>
              <option value="b2">Warehouse B2</option>
              <option value="north">North Campus</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/dashboard" className="w-full">
            <Button variant="default" className="w-full bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-900/20 text-white">
              Authenticate & Enter
            </Button>
          </Link>
          <div className="flex items-center space-x-2 w-full justify-center">
            <input
              type="checkbox"
              id="otp"
              className="h-4 w-4 rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 focus:ring-offset-white"
            />
            <label
              htmlFor="otp"
              className="text-sm font-medium leading-none focus:outline-none text-slate-600"
            >
              Use OTP Login instead
            </label>
          </div>
        </CardFooter>
      </Card>
      
      <div className="absolute bottom-6 text-xs text-slate-500 flex gap-4 z-10">
        <span>EN | ES | FR</span>
        <span>•</span>
        <span>System Status: Optimal</span>
      </div>
    </div>
  )
}
