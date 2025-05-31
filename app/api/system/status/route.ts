import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to connect to Flask backend first
    const response = await fetch("http://localhost:5000/api/system/status", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(2000), // 2 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ ...data, backend_available: true })
    }
  } catch (error) {
    console.log("Flask backend not available, using fallback data")
  }

  // Fallback: Return operational status based on environment variables
  const hasFirebaseCredentials = !!process.env.FIREBASE_CREDENTIALS
  const hasNeonDatabase = !!process.env.DATABASE_URL
  const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY

  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    system_status: {
      api: "operational",
      firestore: hasFirebaseCredentials ? "operational" : "degraded",
      neon: hasNeonDatabase ? "operational" : "degraded",
      ml_pipeline: "operational",
      deepseek: hasDeepSeekKey ? "operational" : "degraded",
    },
    backend_available: false,
    note: "Using Next.js fallback - Flask backend not available",
  })
}
