import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/model/metrics", {
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

  // Fallback: Return zero metrics (real state when no models trained)
  return NextResponse.json({
    status: "success",
    metrics: {
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      last_updated: null,
      model_type: null,
    },
    message: "No trained models found",
    timestamp: new Date().toISOString(),
    backend_available: false,
    note: "No ML models available - Flask backend offline or no training completed",
  })
}
