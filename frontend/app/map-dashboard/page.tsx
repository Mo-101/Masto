"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import ViewToggleLayout from "@/components/layouts/view-toggle-layout"
import { MapIcon, LayoutDashboardIcon } from "lucide-react"

// Dynamically import the CesiumMapViewer component
const CesiumMapViewer = dynamic(() => import("@/components/map/CesiumMapViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-full w-full bg-gray-700 text-white">
      Loading Map Component...
    </div>
  ),
})

// Placeholder for the in-page Command Center view
function IntegratedCommandCenterView() {
  return (
    <div className="p-6 bg-gray-800 text-gray-100 h-full overflow-y-auto">
      <h2 className="text-3xl font-semibold mb-6 border-b border-gray-700 pb-3">Integrated Command Center</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-750 p-4 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2 text-sky-400">System Status</h3>
          <p className="text-gray-300">All systems operational.</p>
        </div>
        <div className="bg-gray-750 p-4 rounded-lg shadow">
          <h3 className="text-xl font-medium mb-2 text-sky-400">Recent Alerts</h3>
          <p className="text-gray-300">No new alerts.</p>
        </div>
        <div className="bg-gray-750 p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-xl font-medium mb-2 text-sky-400">Data Analytics</h3>
          <p className="text-gray-300">Analytics dashboard placeholder...</p>
        </div>
      </div>
    </div>
  )
}

export default function MapDashboardPage() {
  const views = [
    {
      key: "map",
      label: "Map View",
      icon: <MapIcon size={18} />,
      content: (
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-full w-full bg-gray-700 text-white">
              Preparing Map Viewer...
            </div>
          }
        >
          <CesiumMapViewer />
        </Suspense>
      ),
    },
    {
      key: "commandCenter",
      label: "Command Center",
      icon: <LayoutDashboardIcon size={18} />,
      content: <IntegratedCommandCenterView />,
    },
  ]

  return <ViewToggleLayout views={views} initialViewKey="map" />
}
