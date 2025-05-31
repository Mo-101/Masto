import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/train", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ ...data, backend_available: true })
    }
  } catch (error) {
    console.log("Flask backend not available for training trigger")
  }

  // Fallback: Return error message
  return NextResponse.json(
    {
      status: "error",
      message: "Training unavailable - Flask backend offline",
      timestamp: new Date().toISOString(),
      backend_available: false,
    },
    { status: 503 },
  )
}
