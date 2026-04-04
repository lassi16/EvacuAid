import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-white shadow-sm text-slate-900 hover:bg-slate-50": variant === "default",
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200": variant === "secondary",
          "border-transparent bg-brand-red text-white hover:bg-brand-red/80": variant === "destructive",
          "text-slate-900 border-slate-200": variant === "outline",
          "border-transparent bg-brand-green text-white hover:bg-brand-green/80": variant === "success",
          "border-transparent bg-brand-orange text-white hover:bg-brand-orange/80": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
