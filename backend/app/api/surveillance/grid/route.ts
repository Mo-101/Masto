import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/surveillance/grid", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(2000),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ ...data, backend_available: true })
    }
  } catch (error) {
    console.log("Flask backend not available, using fallback data")
  }

  // Fallback: Return zero stats (real state when no sensors deployed)
  return NextResponse.json({
    status: "success",
    grid_stats: {
      active_sensors: 0,
      detections_today: 0,
      high_risk_areas: 0,
    },
    timestamp: new Date().toISOString(),
    backend_available: false,
    note: "Grid stats unavailable - Flask backend offline or no sensors deployed",
  })
}
