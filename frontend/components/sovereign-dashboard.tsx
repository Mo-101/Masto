"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  Brain,
  Database,
  Shield,
  Satellite,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  MapPin,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
} from "lucide-react"

interface SystemStatus {
  api: string
  firestore: string
  neon: string
  ml_pipeline: string
  deepseek: string
}

interface Detection {
  id: string
  location?: { lat: number; lng: number }
  confidence?: number
  detection_timestamp?: string
  risk_level?: string
}

interface MLMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  last_updated?: string
  model_type?: string
}

interface GridStats {
  active_sensors: number
  detections_today: number
  high_risk_areas: number
}

interface SovereigntyStatus {
  firestore: {
    detection_patterns: number
    habitat_analyses: number
    ai_predictions: number
    sync_status: string
  }
  neon: {
    analytics_records: number
    training_sets: number
    avg_query_time: string
  }
}

interface SecurityStatus {
  message: string
  systems_secured: boolean
  audit_available: boolean
}

export default function SovereignDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [backendConnected, setBackendConnected] = useState<boolean>(false)
  const [connectionAttempts, setConnectionAttempts] = useState<number>(0)

  // LIVE DATA STATES - NO MOCK DATA
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: "unknown",
    firestore: "unknown",
    neon: "unknown",
    ml_pipeline: "unknown",
    deepseek: "unknown",
  })

  const [recentDetections, setRecentDetections] = useState<Detection[]>([])
  const [mlMetrics, setMlMetrics] = useState<MLMetrics>({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
  })

  const [gridStats, setGridStats] = useState<GridStats>({
    active_sensors: 0,
    detections_today: 0,
    high_risk_areas: 0,
  })

  const [sovereigntyStatus, setSovereigntyStatus] = useState<SovereigntyStatus>({
    firestore: {
      detection_patterns: 0,
      habitat_analyses: 0,
      ai_predictions: 0,
      sync_status: "unknown",
    },
    neon: {
      analytics_records: 0,
      training_sets: 0,
      avg_query_time: "unknown",
    },
  })

  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    message: "Loading security status...",
    systems_secured: false,
    audit_available: false,
  })

  // LIVE DATA FETCHING FUNCTIONS
  const fetchSystemStatus = async () => {
    try {
      const response = await fetch("/api/system/status")
      const data = await response.json()
      if (data.status === "success") {
        setSystemStatus(data.system_status)
        setBackendConnected(data.backend_available === true)
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error)
      setBackendConnected(false)
    }
  }

  const fetchRecentDetections = async () => {
    try {
      const response = await fetch("/api/detections/recent")
      const data = await response.json()
      if (data.status === "success") {
        setRecentDetections(data.detections)
        if (data.backend_available !== undefined) {
          setBackendConnected(data.backend_available)
        }
      }
    } catch (error) {
      console.error("Failed to fetch recent detections:", error)
      setRecentDetections([])
    }
  }

  const fetchMLMetrics = async () => {
    try {
      const response = await fetch("/api/model/metrics")
      const data = await response.json()
      if (data.status === "success") {
        setMlMetrics(data.metrics)
        if (data.backend_available !== undefined) {
          setBackendConnected(data.backend_available)
        }
      }
    } catch (error) {
      console.error("Failed to fetch ML metrics:", error)
      setMlMetrics({
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
      })
    }
  }

  const fetchGridStats = async () => {
    try {
      const response = await fetch("/api/surveillance/grid")
      const data = await response.json()
      if (data.status === "success") {
        setGridStats(data.grid_stats)
        if (data.backend_available !== undefined) {
          setBackendConnected(data.backend_available)
        }
      }
    } catch (error) {
      console.error("Failed to fetch grid stats:", error)
      setGridStats({
        active_sensors: 0,
        detections_today: 0,
        high_risk_areas: 0,
      })
    }
  }

  const fetchSovereigntyStatus = async () => {
    try {
      const response = await fetch("/api/data/sovereignty")
      const data = await response.json()
      if (data.status === "success") {
        setSovereigntyStatus(data.sovereignty_status)
        if (data.backend_available !== undefined) {
          setBackendConnected(data.backend_available)
        }
      }
    } catch (error) {
      console.error("Failed to fetch sovereignty status:", error)
      setSovereigntyStatus({
        firestore: {
          detection_patterns: 0,
          habitat_analyses: 0,
          ai_predictions: 0,
          sync_status: "unknown",
        },
        neon: {
          analytics_records: 0,
          training_sets: 0,
          avg_query_time: "unknown",
        },
      })
    }
  }

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch("/api/security/status")
      const data = await response.json()
      if (data.status === "success") {
        setSecurityStatus(data.security_status)
        if (data.backend_available !== undefined) {
          setBackendConnected(data.backend_available)
        }
      }
    } catch (error) {
      console.error("Failed to fetch security status:", error)
      setSecurityStatus({
        message: "Security monitoring unavailable",
        systems_secured: false,
        audit_available: false,
      })
    }
  }

  const triggerTraining = async () => {
    try {
      const response = await fetch("/api/train", { method: "POST" })
      const data = await response.json()
      if (data.status === "success") {
        alert("Training triggered successfully!")
        await fetchMLMetrics()
      } else {
        alert("Failed to trigger training: " + data.message)
      }
    } catch (error) {
      console.error("Failed to trigger training:", error)
      alert("Failed to trigger training - backend unavailable")
    }
  }

  const refreshAllData = async () => {
    setLoading(true)
    setConnectionAttempts((prev) => prev + 1)

    await Promise.all([
      fetchSystemStatus(),
      fetchRecentDetections(),
      fetchMLMetrics(),
      fetchGridStats(),
      fetchSovereigntyStatus(),
      fetchSecurityStatus(),
    ])

    setLastUpdate(new Date())
    setLoading(false)
  }

  // INITIAL DATA LOAD AND AUTO-REFRESH
  useEffect(() => {
    refreshAllData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshAllData, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-400"
      case "degraded":
        return "text-yellow-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4" />
      case "degraded":
        return <AlertTriangle className="w-4 h-4" />
      case "down":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case "low":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "high":
        return "bg-orange-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MNTRK Sovereign Command Center
            </h1>
            <p className="text-gray-400">Bio-Surveillance Intelligence Platform • Mastomys Natalensis Tracking</p>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-xs text-gray-500">
                Last Update: {lastUpdate.toLocaleTimeString()} • Live Data Only • No Mock
              </p>
              <div
                className={`flex items-center gap-1 text-xs ${backendConnected ? "text-green-400" : "text-red-400"}`}
              >
                {backendConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {backendConnected ? "Flask Backend Connected" : "Flask Backend Offline"}
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <Server className="w-3 h-3" />
                Next.js API Active
              </div>
            </div>
          </div>
          <Button onClick={refreshAllData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </header>

        {!backendConnected && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Flask backend is offline. Showing real system state (zero values = no data ingested yet). Start Flask
              server on port 5000 to enable full functionality.
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                Connection attempts: {connectionAttempts} • Next.js API routes are working
              </span>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="dashboard" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Command Dashboard
            </TabsTrigger>
            <TabsTrigger value="surveillance" className="data-[state=active]:bg-blue-600">
              <Satellite className="w-4 h-4 mr-2" />
              Surveillance Grid
            </TabsTrigger>
            <TabsTrigger value="ml" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              ML Intelligence
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-blue-600">
              <Database className="w-4 h-4 mr-2" />
              Data Sovereignty
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-blue-600">
              <Shield className="w-4 h-4 mr-2" />
              Sovereign Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* LIVE SYSTEM STATUS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    API Gateway
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.api)}`}>
                    {getStatusIcon(systemStatus.api)}
                    <span className="ml-2 capitalize">{systemStatus.api}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Firestore
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.firestore)}`}>
                    {getStatusIcon(systemStatus.firestore)}
                    <span className="ml-2 capitalize">{systemStatus.firestore}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    ML Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.ml_pipeline)}`}>
                    {getStatusIcon(systemStatus.ml_pipeline)}
                    <span className="ml-2 capitalize">{systemStatus.ml_pipeline}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Neon Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.neon)}`}>
                    {getStatusIcon(systemStatus.neon)}
                    <span className="ml-2 capitalize">{systemStatus.neon}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    DeepSeek AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.deepseek)}`}>
                    {getStatusIcon(systemStatus.deepseek)}
                    <span className="ml-2 capitalize">{systemStatus.deepseek}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* LIVE DETECTION FEED */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Real-time Detection Feed ({recentDetections.length} live)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDetections.length > 0 ? (
                    recentDetections.slice(0, 5).map((detection) => (
                      <div key={detection.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRiskBadgeColor(detection.risk_level)}>
                            {detection.risk_level ? detection.risk_level.toUpperCase() : "UNKNOWN"}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">
                              Detection at {detection.location?.lat?.toFixed(4) || "N/A"},{" "}
                              {detection.location?.lng?.toFixed(4) || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Confidence: {detection.confidence ? (detection.confidence * 100).toFixed(1) : "N/A"}%
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {detection.detection_timestamp
                            ? new Date(detection.detection_timestamp).toLocaleTimeString()
                            : "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No live detections available</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {backendConnected
                          ? "Waiting for field data ingestion..."
                          : "Start Flask backend and ingest detection data to see live feed"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveillance" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Satellite className="w-5 h-5 mr-2" />
                  Live Surveillance Grid Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{gridStats.active_sensors}</div>
                    <div className="text-sm text-gray-400">Active Sensors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{gridStats.detections_today}</div>
                    <div className="text-sm text-gray-400">Detections Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{gridStats.high_risk_areas}</div>
                    <div className="text-sm text-gray-400">High Risk Areas</div>
                  </div>
                </div>
                {!backendConnected && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Real surveillance data requires Flask backend connection
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Live ML Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm font-medium">{mlMetrics.accuracy.toFixed(1)}%</span>
                    </div>
                    <Progress value={mlMetrics.accuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Precision</span>
                      <span className="text-sm font-medium">{mlMetrics.precision.toFixed(1)}%</span>
                    </div>
                    <Progress value={mlMetrics.precision} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Recall</span>
                      <span className="text-sm font-medium">{mlMetrics.recall.toFixed(1)}%</span>
                    </div>
                    <Progress value={mlMetrics.recall} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">F1 Score</span>
                      <span className="text-sm font-medium">{mlMetrics.f1Score.toFixed(1)}%</span>
                    </div>
                    <Progress value={mlMetrics.f1Score} className="h-2" />
                  </div>
                </div>
                {mlMetrics.last_updated && (
                  <p className="text-xs text-gray-400">
                    Last Updated: {new Date(mlMetrics.last_updated).toLocaleString()}
                  </p>
                )}
                {!backendConnected && (
                  <p className="text-xs text-gray-500">
                    Zero metrics indicate no models trained yet. Start Flask backend to train models.
                  </p>
                )}
                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={triggerTraining}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!backendConnected}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trigger Training
                  </Button>
                  <Button variant="outline" className="border-gray-600" disabled={!backendConnected}>
                    View Model Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Live Data Sovereignty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Firebase Firestore</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Detection Patterns</span>
                        <span className="text-green-400">
                          {sovereigntyStatus.firestore.detection_patterns.toLocaleString()} records
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Habitat Analyses</span>
                        <span className="text-green-400">
                          {sovereigntyStatus.firestore.habitat_analyses.toLocaleString()} records
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Predictions</span>
                        <span className="text-green-400">
                          {sovereigntyStatus.firestore.ai_predictions.toLocaleString()} records
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Real-time Sync</span>
                        <span className="text-green-400 capitalize">{sovereigntyStatus.firestore.sync_status}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Neon PostgreSQL</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Analytics Data</span>
                        <span className="text-blue-400">
                          {sovereigntyStatus.neon.analytics_records.toLocaleString()} records
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ML Training Sets</span>
                        <span className="text-blue-400">
                          {sovereigntyStatus.neon.training_sets.toLocaleString()} models
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Query Performance</span>
                        <span className="text-blue-400">{sovereigntyStatus.neon.avg_query_time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!backendConnected && (
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Zero counts indicate no data ingested yet. Start Flask backend to populate databases.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Live Sovereign Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert
                  className={`border-${securityStatus.systems_secured ? "blue" : "red"}-500 bg-${securityStatus.systems_secured ? "blue" : "red"}-500/10`}
                >
                  <Shield className="h-4 w-4" />
                  <AlertDescription>{securityStatus.message}</AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gray-700 hover:bg-gray-600" disabled={!backendConnected}>
                    Manage API Keys
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600" disabled={!backendConnected}>
                    Configure Alerts
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600" disabled={!backendConnected}>
                    Security Settings
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600" disabled={!backendConnected}>
                    System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
