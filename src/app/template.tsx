"use client"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="w-full h-full"
      style={{ animation: 'pageFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      {children}
    </div>
  )
}
