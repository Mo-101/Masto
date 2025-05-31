import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/data/sovereignty", {
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

  // Fallback: Return zero counts (real state when no data exists)
  return NextResponse.json({
    status: "success",
    sovereignty_status: {
      firestore: {
        detection_patterns: 0,
        habitat_analyses: 0,
        ai_predictions: 0,
        sync_status: "offline",
      },
      neon: {
        analytics_records: 0,
        training_sets: 0,
        avg_query_time: "N/A",
      },
    },
    timestamp: new Date().toISOString(),
    backend_available: false,
    note: "Data sovereignty unavailable - Flask backend offline",
  })
}
