"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Fullscreen Routes get no structural padding or sidebars!
  if (pathname === "/" || pathname === "/login") {
    return (
      <main className="w-full h-screen bg-slate-950 flex flex-col antialiased overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    );
  }

  // Dashboard Application Layout
  return (
    <div className="flex h-screen w-full bg-background antialiased min-h-0">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <Topbar />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-background p-6 selection:bg-sky-200">
          {children}
        </main>
      </div>
      <FloatingChatWidget />
    </div>
  );
}
