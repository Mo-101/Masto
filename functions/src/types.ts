import type * as FirebaseFirestore from "@google-cloud/firestore"

export interface DetectionPattern {
  latitude: number
  longitude: number
  species: string
  confidence_score: number
  detection_timestamp: FirebaseFirestore.Timestamp
  image_url?: string
  environmental_context?: {
    temperature?: number
    humidity?: number
    weather?: string
  }
}

export interface OutbreakAlert {
  alert_type: string
  severity_level: number
  latitude: number
  longitude: number
  radius_km: number
  description: string
  status: "active" | "resolved"
  alert_timestamp: FirebaseFirestore.Timestamp
  metadata?: {
    detection_count: number
    avg_confidence: number
    triggering_detection_id: string
  }
}

export interface TrainingTrigger {
  type: "scheduled" | "full"
  model_type: string
  trigger_reason: string
  force_retrain?: boolean
  status: "pending" | "running" | "completed" | "error"
  created_at: FirebaseFirestore.Timestamp
}
