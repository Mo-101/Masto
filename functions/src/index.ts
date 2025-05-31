import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as cors from "cors"

// Initialize Firebase Admin
admin.initializeApp()

const corsHandler = cors({ origin: true })

/**
 * Detection Pattern Trigger
 * Triggered when a new detection pattern is created
 */
export const onDetectionCreated = functions.firestore
  .document("detection_patterns/{documentId}")
  .onCreate(async (snap, context) => {
    const detection = snap.data()
    const documentId = context.params.documentId

    console.log(`New detection created: ${documentId}`)

    try {
      // Check for anomalies
      await checkForAnomalies(detection, documentId)

      // Trigger ML retraining if needed
      await checkRetrainingTrigger()

      return { success: true, documentId }
    } catch (error) {
      console.error("Error processing detection:", error)
      throw error
    }
  })

/**
 * Anomaly Detection Function
 */
async function checkForAnomalies(detection: any, documentId: string) {
  const db = admin.firestore()
  const latitude = detection.latitude
  const longitude = detection.longitude

  if (!latitude || !longitude) {
    console.warn(`Missing location data in detection ${documentId}`)
    return
  }

  // Query for recent detections in the area
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const areaDetections = await db
    .collection("detection_patterns")
    .where("latitude", ">=", latitude - 0.1)
    .where("latitude", "<=", latitude + 0.1)
    .where("detection_timestamp", ">=", weekAgo)
    .get()

  // Filter by longitude (Firestore limitation)
  const filteredDetections = areaDetections.docs.filter((doc) => {
    const data = doc.data()
    return Math.abs(data.longitude - longitude) <= 0.1
  })

  // Check for potential outbreak
  if (filteredDetections.length >= 5) {
    const confidenceScores = filteredDetections.map((doc) => doc.data().confidence_score || 0)
    const avgConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length

    if (avgConfidence > 0.7) {
      // Create outbreak alert
      await db.collection("outbreak_alerts").add({
        alert_type: "population_spike",
        severity_level: 3,
        latitude,
        longitude,
        radius_km: 10,
        description: `Potential population spike detected with ${filteredDetections.length} observations`,
        status: "active",
        alert_timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          detection_count: filteredDetections.length,
          avg_confidence: avgConfidence,
          triggering_detection_id: documentId,
        },
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })

      console.log(`Created outbreak alert for area: ${latitude}, ${longitude}`)
    }
  }
}

/**
 * ML Retraining Trigger Check
 */
async function checkRetrainingTrigger() {
  const db = admin.firestore()

  // Get ML model metadata
  const modelMetaRef = db.collection("ml_models").doc("habitat_predictor")
  const modelMeta = await modelMetaRef.get()

  if (!modelMeta.exists) {
    // Initialize model metadata
    await modelMetaRef.set({
      last_trained: admin.firestore.FieldValue.serverTimestamp(),
      version: "1.0.0",
      new_data_count: 1,
      total_data_count: 1,
      accuracy: 0.0,
      status: "initialized",
    })
    return
  }

  const metaData = modelMeta.data()
  const newCount = (metaData?.new_data_count || 0) + 1

  // Update new data count
  await modelMetaRef.update({
    new_data_count: newCount,
  })

  // Check if retraining is needed
  const retrainThreshold = 10
  if (newCount >= retrainThreshold) {
    // Trigger retraining
    await db.collection("training_triggers").add({
      type: "scheduled",
      model_type: "habitat_predictor",
      trigger_reason: "data_threshold_reached",
      data_count: newCount,
      status: "pending",
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    })

    // Reset counter
    await modelMetaRef.update({
      new_data_count: 0,
      status: "retraining_queued",
    })

    console.log("ML retraining triggered due to data threshold")
  }
}

/**
 * Manual Training Trigger
 */
export const triggerTraining = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { modelType = "all", force = false } = req.body

      const db = admin.firestore()

      // Create training trigger
      const triggerDoc = await db.collection("training_triggers").add({
        type: force ? "full" : "scheduled",
        model_type: modelType,
        trigger_reason: "manual_trigger",
        force_retrain: force,
        status: "pending",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      })

      res.json({
        success: true,
        message: `Training triggered for ${modelType}`,
        trigger_id: triggerDoc.id,
      })
    } catch (error) {
      console.error("Error triggering training:", error)
      res.status(500).json({
        success: false,
        error: "Failed to trigger training",
      })
    }
  })
})

/**
 * System Health Check
 */
export const healthCheck = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const db = admin.firestore()

      // Update system status
      await db.collection("system_status").doc("health").set(
        {
          status: "operational",
          last_check: admin.firestore.FieldValue.serverTimestamp(),
          functions_active: true,
          project_id: "tokyo-scholar-356213",
        },
        { merge: true },
      )

      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        project: "tokyo-scholar-356213",
        functions: "operational",
      })
    } catch (error) {
      console.error("Health check failed:", error)
      res.status(500).json({
        status: "unhealthy",
        error: error.message,
      })
    }
  })
})

/**
 * Data Analytics Function
 */
export const getAnalytics = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const db = admin.firestore()

      // Get detection count for last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const detectionsQuery = await db
        .collection("detection_patterns")
        .where("detection_timestamp", ">=", thirtyDaysAgo)
        .get()

      // Get active alerts
      const alertsQuery = await db.collection("outbreak_alerts").where("status", "==", "active").get()

      // Get training jobs
      const trainingQuery = await db.collection("training_jobs").orderBy("created_at", "desc").limit(10).get()

      const analytics = {
        detections_last_30_days: detectionsQuery.size,
        active_alerts: alertsQuery.size,
        recent_training_jobs: trainingQuery.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        timestamp: new Date().toISOString(),
      }

      res.json(analytics)
    } catch (error) {
      console.error("Analytics error:", error)
      res.status(500).json({
        error: "Failed to get analytics",
      })
    }
  })
})
