"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as Cesium from "cesium"
import "cesium/Build/Cesium/Widgets/widgets.css"
import { WindControls } from "./wind-controls"
import { fetchWindData } from "@/lib/wind-data"
import { WindParticleSystem } from "@/lib/wind-particle-system"
import { CESIUM_KEY } from "@/lib/cesium-key"

// Initialize Cesium access token
if (CESIUM_KEY) {
  Cesium.Ion.defaultAccessToken = CESIUM_KEY
} else {
  // This console error will appear if CESIUM_KEY is empty or undefined
  console.error(
    "CesiumMapViewer: Cesium ION token is not available from frontend/lib/cesium-key.ts. " +
      "Ensure NEXT_PUBLIC_CESIUM_TOKEN is set in the environment.",
  )
}

// Ensure Cesium assets are correctly pathed
if (typeof window !== "undefined") {
  ;(window as any).CESIUM_BASE_URL = "/cesium/"
}

export default function CesiumMapViewer() {
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null)
  const [windSystem, setWindSystem] = useState<WindParticleSystem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [windSettings, setWindSettings] = useState({
    speed: 1.0,
    particleCount: 5000,
    particleSize: 1.5,
    colorMode: "speed",
    showStreamlines: true,
    altitude: 10000,
  })
  const [windData, setWindData] = useState<any>(null)

  useEffect(() => {
    if (!cesiumContainerRef.current) return

    if (!CESIUM_KEY) {
      if (cesiumContainerRef.current) {
        cesiumContainerRef.current.innerHTML =
          '<div class="flex justify-center items-center h-full text-red-500 bg-black p-4 text-center">Cesium ION Token (NEXT_PUBLIC_CESIUM_TOKEN) is missing or invalid. Map cannot be loaded. Please ensure the environment variable is set correctly.</div>'
      }
      setIsLoading(false)
      return
    }

    // Ensure Ion token is set before creating viewer
    // This was already done globally, but double-check for safety
    if (Cesium.Ion.defaultAccessToken !== CESIUM_KEY) {
      Cesium.Ion.defaultAccessToken = CESIUM_KEY
    }

    const cesiumViewer = new Cesium.Viewer(cesiumContainerRef.current, {
      terrainProvider: Cesium.createWorldTerrain(),
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      imageryProvider: new Cesium.IonImageryProvider({ assetId: 3845 }),
    })

    cesiumViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
      orientation: {
        heading: 0.0,
        pitch: -Math.PI / 2,
        roll: 0.0,
      },
    })

    cesiumViewer.scene.globe.enableLighting = true
    cesiumViewer.scene.globe.depthTestAgainstTerrain = true
    cesiumViewer.scene.skyAtmosphere.show = true
    cesiumViewer.scene.fog.enabled = true
    ;(cesiumViewer.cesiumWidget.creditContainer as HTMLElement).style.display = "none"

    setViewer(cesiumViewer)
    // setIsLoading(false); // Moved to wind data loading effect

    return () => {
      if (windSystem) {
        windSystem.destroy()
        setWindSystem(null)
      }
      if (cesiumViewer && !cesiumViewer.isDestroyed()) {
        cesiumViewer.destroy()
      }
      setViewer(null)
    }
  }, []) // Removed dependencies that might cause re-init

  useEffect(() => {
    if (!viewer || !CESIUM_KEY) {
      // If viewer is null (e.g. token missing), don't try to load wind data
      if (!CESIUM_KEY) setIsLoading(false) // Ensure loading stops if token is the issue
      return
    }

    let currentWindSystem: WindParticleSystem | null = null
    const initializeWind = async () => {
      setIsLoading(true) // Set loading true when starting to fetch/init wind
      try {
        const data = await fetchWindData()
        setWindData(data)
        if (viewer && !viewer.isDestroyed()) {
          currentWindSystem = new WindParticleSystem(viewer, data, windSettings)
          setWindSystem(currentWindSystem)
        }
      } catch (error) {
        console.error("Failed to initialize wind system:", error)
      } finally {
        setIsLoading(false)
      }
    }
    initializeWind()
    return () => {
      if (currentWindSystem) {
        currentWindSystem.destroy()
      }
    }
  }, [viewer]) // Depends only on viewer

  useEffect(() => {
    if (windSystem && windData && viewer && !viewer.isDestroyed()) {
      windSystem.updateSettings(windSettings)
    }
  }, [windSettings, windSystem, windData, viewer])

  const handleSettingsChange = useCallback((newSettings: Partial<typeof windSettings>) => {
    setWindSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const handleFetchWindData = useCallback(async () => {
    if (!viewer || viewer.isDestroyed()) return
    setIsLoading(true)
    try {
      const data = await fetchWindData()
      setWindData(data)
      if (windSystem) {
        windSystem.destroy()
      }
      const newWindSystem = new WindParticleSystem(viewer, data, windSettings)
      setWindSystem(newWindSystem)
    } catch (error) {
      console.error("Failed to refresh wind data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [viewer, windSystem, windSettings])

  if (typeof window !== "undefined" && !CESIUM_KEY) {
    // This case is handled by the initial check in the first useEffect,
    // but kept here as a fallback rendering if ref isn't available yet.
    return (
      <div className="flex justify-center items-center h-full w-full bg-black text-red-500 p-4 text-center">
        Cesium ION Token (NEXT_PUBLIC_CESIUM_TOKEN) is missing. Map cannot be loaded.
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={cesiumContainerRef} className="absolute h-full w-full bg-black" />
      {isLoading && ( // General loading overlay for both Cesium init and wind data loading
        <div className="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center bg-black text-white">
          <div className="mb-4 text-2xl font-bold text-cyan-400">DEEPTRACK™ WIND VISUALIZATION</div>
          <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-800">
            <div className="animate-pulse-x h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"></div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            {!viewer ? "Initializing Cesium Engine..." : "Loading Wind Data..."}
          </div>
        </div>
      )}
      {!isLoading &&
        viewer && ( // Only show title and controls if not loading AND viewer exists
          <>
            <div className="absolute left-4 top-4 z-10 pointer-events-none">
              <h1 className="mb-2 text-2xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                <span className="text-cyan-400">DEEPTRACK™</span> WIND VISUALIZATION
              </h1>
            </div>
            <WindControls
              settings={windSettings}
              onSettingsChange={handleSettingsChange}
              isLoading={isLoading}
              windData={windData}
              fetchWindData={handleFetchWindData}
              setWindData={setWindData}
            />
          </>
        )}
    </div>
  )
}
