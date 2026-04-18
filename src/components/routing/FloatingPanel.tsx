"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";

export interface FloatingPanelProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  defaultMinimized?: boolean;
  className?: string;
  width?: string | number;
  contentMaxHeight?: string | number;
  containerStyle?: React.CSSProperties;
  onClose?: () => void;
}

export function FloatingPanel({
  title,
  children,
  icon,
  position = "top-left",
  defaultMinimized = false,
  className = "",
  width = 320,
  contentMaxHeight = "70vh",
  containerStyle,
  onClose,
}: FloatingPanelProps) {
  const [minimized, setMinimized] = useState(defaultMinimized);

  // Mapping position to absolute CSS classes
  const posClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-6 left-4",
    "bottom-right": "bottom-6 right-4",
  }[position];

  return (
    <div
      className={`absolute z-70 flex flex-col overflow-hidden bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl transition-all duration-300 ease-in-out ${posClasses} ${className}`}
      style={{ width, ...containerStyle }}
    >
      {/* Header / Drag Handle */}
      <div
        className="flex items-center justify-between px-3 py-2.5 bg-slate-100/50 border-b border-slate-200 cursor-pointer select-none group hover:bg-slate-100 transition-colors"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
          <span className="text-slate-500 flex items-center justify-center">
            {minimized ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
          {icon && <span className="text-sky-600">{icon}</span>}
          <span className="tracking-tight">{title}</span>
        </div>

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out ${minimized ? "max-h-0 opacity-0 overflow-hidden" : "opacity-100 overflow-y-auto"}`}
        style={minimized ? undefined : { maxHeight: contentMaxHeight }}
      >
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}
