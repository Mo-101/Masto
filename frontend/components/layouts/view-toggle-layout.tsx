"use client"

import { useState, type ReactNode } from "react"
import { MapIcon as MapIconDefault, LayoutDashboardIcon as LayoutDashboardIconDefault } from "lucide-react" // Default icons

interface ViewToggleLayoutProps {
  views: {
    key: string
    label: string
    icon?: ReactNode
    content: ReactNode
  }[]
  initialViewKey?: string
  navAriaLabel?: string
}

export default function ViewToggleLayout({
  views,
  initialViewKey,
  navAriaLabel = "Main content views",
}: ViewToggleLayoutProps) {
  const initialKey = initialViewKey || (views.length > 0 ? views[0].key : undefined)
  const [activeViewKey, setActiveViewKey] = useState(initialKey)

  if (!views || views.length === 0) {
    return <div>Error: No views provided to ViewToggleLayout.</div>
  }

  const NavButton = ({
    viewKey,
    label,
    icon,
  }: {
    viewKey: string
    label: string
    icon?: ReactNode
  }) => (
    <button
      onClick={() => setActiveViewKey(viewKey)}
      className={`
        flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
        hover:bg-sky-600 
        ${
          activeViewKey === viewKey
            ? "bg-sky-500 text-white shadow-lg ring-2 ring-sky-300"
            : "bg-gray-700 text-gray-300 hover:text-white"
        }
        focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75
        sm:px-4 sm:text-base
      `}
      aria-pressed={activeViewKey === viewKey}
      role="tab" // Using tab role for semantics
      aria-controls={`view-panel-${viewKey}`}
      aria-selected={activeViewKey === viewKey}
    >
      {icon || (viewKey === "map" ? <MapIconDefault size={18} /> : <LayoutDashboardIconDefault size={18} />)}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="w-full h-full flex flex-col bg-gray-800">
      <div
        className="p-2 sm:p-3 bg-gray-900/80 backdrop-blur-sm text-white flex justify-center items-center gap-2 sm:gap-3 shadow-lg z-20 flex-shrink-0"
        role="tablist" // Tablist role for the container
        aria-label={navAriaLabel}
      >
        {views.map((view) => (
          <NavButton key={view.key} viewKey={view.key} label={view.label} icon={view.icon} />
        ))}
      </div>
      <div className="flex-grow relative overflow-hidden">
        {views.map((view) => (
          <div
            key={view.key}
            id={`view-panel-${view.key}`}
            role="tabpanel" // Tabpanel role for content
            aria-labelledby={`tab-button-${view.key}`} // This would require ids on buttons, simplified for now
            className={`w-full h-full absolute inset-0 transition-opacity duration-300 ease-in-out ${
              activeViewKey === view.key ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Render content only when active to optimize, especially for heavy components like Cesium */}
            {activeViewKey === view.key && view.content}
          </div>
        ))}
      </div>
    </div>
  )
}
