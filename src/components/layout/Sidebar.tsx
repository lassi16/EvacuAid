"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  CheckSquare, 
  Bell, 
  BarChart3, 
  Settings,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Building Map", href: "/map", icon: MapIcon },
  { name: "Incidents", href: "/incidents", icon: AlertTriangle },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  if (pathname === "/login") return null

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2 text-brand-red">
          <ShieldAlert className="h-6 w-6" />
          <span className="text-xl font-bold text-slate-900 tracking-widest">EvacuAid</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white shadow-sm text-sky-600"
                  : "text-slate-500 hover:bg-white hover:text-sky-600"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-sky-600" : "text-slate-400 group-hover:text-sky-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      {/* Current User Role Mock UI */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sm text-sky-600">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">Global Access</p>
          </div>
        </div>
      </div>
    </div>
  )
}
