"use client"

import { useEffect, useRef } from "react"
import { Viewer, Ion, createWorldTerrainAsync, Cartesian3 } from "cesium"
import "cesium/Build/Cesium/Widgets/widgets.css" // Essential for Cesium default UI styles

// Cesium Ion access token will be read from environment variable
const CESIUM_ION_TOKEN = process.env.NEXT_PUBLIC_CESIUM_TOKEN

if (CESIUM_ION_TOKEN) {
  Ion.defaultAccessToken = CESIUM_ION_TOKEN
}

export default function CesiumStandaloneViewer() {
  const viewerRef = useRef<HTMLDivElement>(null)
  const viewerInstanceRef = useRef<Viewer | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && viewerRef.current && !viewerInstanceRef.current) {
      if (!CESIUM_ION_TOKEN) {
        console.error("Cesium ION token is not set! Please set NEXT_PUBLIC_CESIUM_TOKEN.")
        // Optionally render a message in the div if the token is missing
        if (viewerRef.current) {
          viewerRef.current.innerHTML =
            '<div style="color: red; display: flex; align-items: center; justify-content: center; height: 100%;">' +
            "Cesium ION token (NEXT_PUBLIC_CESIUM_TOKEN) is missing. Map cannot be loaded.</div>"
        }
        return
      }
      // Set the base URL for Cesium's static assets
      ;(window as any).CESIUM_BASE_URL = "/cesium/"

      const viewer = new Viewer(viewerRef.current, {
        terrainProvider: createWorldTerrainAsync(),
        shouldAnimate: true,
        // Add other viewer options here if needed
        // e.g., imageryProvider, baseLayerPicker, geocoder, homeButton, etc.
      })
      viewerInstanceRef.current = viewer

      // Example: Fly to a specific location
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-75.59777, 40.03883, 300000), // Example: King of Prussia, PA
        duration: 3,
      })

      // Optional: Add a default imagery layer if not using Cesium Ion default
      // viewer.imageryLayers.addImageryProvider(new IonImageryProvider({ assetId: YOUR_IMAGERY_ASSET_ID }));
    }

    return () => {
      // Cleanup when the component unmounts
      if (viewerInstanceRef.current && !viewerInstanceRef.current.isDestroyed()) {
        viewerInstanceRef.current.destroy()
        viewerInstanceRef.current = null
      }
    }
  }, []) // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return <div ref={viewerRef} className="w-full h-full bg-black" />
}
