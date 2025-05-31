import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/security/status", {
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

  // Fallback: Return basic security status
  return NextResponse.json({
    status: "success",
    security_status: {
      message: "Security monitoring unavailable - Flask backend offline",
      systems_secured: false,
      audit_available: false,
    },
    timestamp: new Date().toISOString(),
    backend_available: false,
    note: "Security status unavailable - Flask backend offline",
  })
}
