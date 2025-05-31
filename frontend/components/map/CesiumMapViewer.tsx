"use client"

import { useEffect, useRef } from "react"
import { Viewer, Ion, createWorldTerrainAsync, Cartesian3 } from "cesium"
import "cesium/Build/Cesium/Widgets/widgets.css"

// Ensure the token is only accessed on the client-side
let cesiumToken = ""
if (typeof process !== "undefined" && process.env && process.env.NEXT_PUBLIC_CESIUM_TOKEN) {
  cesiumToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN
} else if (typeof window !== "undefined") {
  // Fallback for environments where process.env might not be directly available at module load
  // but this is less ideal. Best to ensure NEXT_PUBLIC_ vars are correctly bundled.
  console.warn("Reading NEXT_PUBLIC_CESIUM_TOKEN directly from process.env failed, ensure it's set and available.")
}

if (cesiumToken) {
  Ion.defaultAccessToken = cesiumToken
} else {
  console.error("Cesium ION token is not set! Please set NEXT_PUBLIC_CESIUM_TOKEN.")
}

export default function CesiumMapViewer() {
  const viewerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (viewerRef.current && typeof window !== "undefined") {
      // Ensure window context
      if (!Ion.defaultAccessToken) {
        console.error("Cesium ION token is missing. Map cannot be initialized.")
        if (viewerRef.current) {
          viewerRef.current.innerHTML =
            '<div class="flex justify-center items-center h-full text-red-500">Cesium ION Token is missing. Cannot load map.</div>'
        }
        return
      }
      ;(window as any).CESIUM_BASE_URL = "/cesium/" // Ensure trailing slash

      const viewer = new Viewer(viewerRef.current, {
        terrainProvider: createWorldTerrainAsync(),
        shouldAnimate: true,
        // Consider adding baseLayerPicker: false, geocoder: false etc. to simplify UI
      })

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400000), // Zoomed out a bit
      })

      return () => {
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy()
        }
      }
    }
  }, [])

  return <div ref={viewerRef} className="w-full h-full bg-black" />
}
