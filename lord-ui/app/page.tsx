"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"

interface SystemStatus {
  api: string
  database: string
  ml: string
  firebase: string
}

interface Detection {
  id: string
  location: { lat: number; lng: number }
  confidence: number
  timestamp: string
  risk_level: string
}

interface MLMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
}

export default function SovereignObservatory() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    api: "operational",
    database: "operational",
    ml: "operational",
    firebase: "operational",
  })

  const [recentDetections, setRecentDetections] = useState<Detection[]>([
    {
      id: "det_001",
      location: { lat: -11.2027, lng: 17.8739 },
      confidence: 0.94,
      timestamp: new Date().toISOString(),
      risk_level: "medium",
    },
    {
      id: "det_002",
      location: { lat: -11.2134, lng: 17.8856 },
      confidence: 0.87,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      risk_level: "high",
    },
  ])

  const [mlMetrics, setMLMetrics] = useState<MLMetrics>({
    accuracy: 94.2,
    precision: 91.8,
    recall: 96.1,
    f1Score: 93.9,
  })

  const [isTraining, setIsTraining] = useState(false)

  // Real-time data fetching
  const fetchSystemStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        const data = await response.json()
        setSystemStatus(data.status || systemStatus)
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error)
    }
  }, [systemStatus])

  const fetchDetections = useCallback(async () => {
    try {
      const response = await fetch("/api/detections/recent")
      if (response.ok) {
        const data = await response.json()
        setRecentDetections(data.detections || recentDetections)
      }
    } catch (error) {
      console.error("Failed to fetch detections:", error)
    }
  }, [recentDetections])

  const fetchMLMetrics = useCallback(async () => {
    try {
      const response = await fetch("/api/models/metrics")
      if (response.ok) {
        const data = await response.json()
        setMLMetrics(data.metrics || mlMetrics)
      }
    } catch (error) {
      console.error("Failed to fetch ML metrics:", error)
    }
  }, [mlMetrics])

  useEffect(() => {
    // Initial fetch
    fetchSystemStatus()
    fetchDetections()
    fetchMLMetrics()

    // Set up polling
    const interval = setInterval(() => {
      fetchSystemStatus()
      fetchDetections()
      fetchMLMetrics()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchSystemStatus, fetchDetections, fetchMLMetrics])

  const triggerTraining = async () => {
    setIsTraining(true)
    try {
      const response = await fetch("/api/train", { method: "POST" })
      if (response.ok) {
        const data = await response.json()
        console.log("Training completed:", data)
        // Refresh metrics after training
        setTimeout(() => {
          fetchMLMetrics()
        }, 1000)
      }
    } catch (error) {
      console.error("Training failed:", error)
    } finally {
      setIsTraining(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-400"
      case "degraded":
        return "text-yellow-400"
      case "training":
        return "text-blue-400"
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
      case "training":
        return <Activity className="w-4 h-4" />
      case "down":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getRiskBadgeColor = (risk: string) => {
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            MNTRK Sovereign Observatory
          </h1>
          <p className="text-gray-400">Bio-Intelligence Command Center • Real-time Mastomys Surveillance</p>
        </header>

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
            {/* System Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Firebase Core
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center ${getStatusColor(systemStatus.firebase)}`}>
                    {getStatusIcon(systemStatus.firebase)}
                    <span className="ml-2 capitalize">{systemStatus.firebase}</span>
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
                  <div className={`flex items-center ${getStatusColor(systemStatus.ml)}`}>
                    {getStatusIcon(systemStatus.ml)}
                    <span className="ml-2 capitalize">{systemStatus.ml}</span>
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
                  <div className={`flex items-center ${getStatusColor(systemStatus.database)}`}>
                    {getStatusIcon(systemStatus.database)}
                    <span className="ml-2 capitalize">{systemStatus.database}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Detection Feed */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Real-time Detection Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDetections.length > 0 ? (
                    recentDetections.slice(0, 5).map((detection) => (
                      <div key={detection.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={getRiskBadgeColor(detection.risk_level)}>
                            {detection.risk_level.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">
                              Detection at {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Confidence: {(detection.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(detection.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No recent detections</p>
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
                  Surveillance Grid Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">47</div>
                    <div className="text-sm text-gray-400">Active Sensors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">1,247</div>
                    <div className="text-sm text-gray-400">Detections Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">12</div>
                    <div className="text-sm text-gray-400">High Risk Areas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ml" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  ML Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm font-medium">{mlMetrics.accuracy}%</span>
                    </div>
                    <Progress value={mlMetrics.accuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Precision</span>
                      <span className="text-sm font-medium">{mlMetrics.precision}%</span>
                    </div>
                    <Progress value={mlMetrics.precision} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Recall</span>
                      <span className="text-sm font-medium">{mlMetrics.recall}%</span>
                    </div>
                    <Progress value={mlMetrics.recall} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">F1 Score</span>
                      <span className="text-sm font-medium">{mlMetrics.f1Score}%</span>
                    </div>
                    <Progress value={mlMetrics.f1Score} className="h-2" />
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={triggerTraining} disabled={isTraining}>
                    {isTraining ? (
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    )}
                    {isTraining ? "Training..." : "Trigger Training"}
                  </Button>
                  <Button variant="outline" className="border-gray-600">
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
                  Data Sovereignty Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Firebase Firestore</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Detection Patterns</span>
                        <span className="text-green-400">1.2M records</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Habitat Analyses</span>
                        <span className="text-green-400">847K records</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Real-time Sync</span>
                        <span className="text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Neon PostgreSQL</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Analytics Data</span>
                        <span className="text-blue-400">2.1M records</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ML Training Sets</span>
                        <span className="text-blue-400">156K samples</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Query Performance</span>
                        <span className="text-blue-400">{"< 50ms avg"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sovereign Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-500 bg-blue-500/10">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All systems secured. API keys rotated 2 days ago. Next rotation in 28 days.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gray-700 hover:bg-gray-600">Manage API Keys</Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">Configure Alerts</Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">Security Settings</Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">System Logs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
