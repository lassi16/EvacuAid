"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useIncidentStore } from "@/stores/incidentStore"

export function Topbar() {
  const pathname = usePathname()
  const initialize = useIncidentStore(s => s.initialize)

  useEffect(() => {
    initialize().catch(err => console.error("Failed to initialize shared incident data", err))
  }, [initialize])

  if (pathname === "/login") return null

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <label htmlFor="search" className="sr-only">
            Search incidents or locations
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
              placeholder="Search incidents or commands..."
              type="search"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Mock Language Switcher */}
        <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-700">
          <Globe className="h-4 w-4" />
          EN
        </Button>
        
        {/* Notifications Mock */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-800">
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-red animate-pulse" />
          <Bell className="h-5 w-5" />
          <span className="sr-only">View notifications</span>
        </Button>
        
        <div className="h-8 w-px bg-slate-200" aria-hidden="true" />
        
        <div className="text-sm font-medium text-slate-700 flex items-center">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-brand-green mr-2 animate-pulse" />
          System Online
        </div>
      </div>
    </header>
  )
}
