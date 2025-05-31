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
  BarChart3,
  Settings,
  RefreshCw,
  Users,
  Globe,
  Clock,
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
  species: string
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const [recentDetections, setRecentDetections] = useState<Detection[]>([
    {
      id: "det_001",
      location: { lat: -11.2027, lng: 17.8739 },
      confidence: 0.94,
      timestamp: new Date().toISOString(),
      risk_level: "high",
      species: "Mastomys natalensis",
    },
    {
      id: "det_002",
      location: { lat: -11.2134, lng: 17.8856 },
      confidence: 0.87,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      risk_level: "medium",
      species: "Mastomys erythroleucus",
    },
    {
      id: "det_003",
      location: { lat: -11.1987, lng: 17.8912 },
      confidence: 0.92,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      risk_level: "high",
      species: "Mastomys natalensis",
    },
  ])

  const [mlMetrics, setMLMetrics] = useState<MLMetrics>({
    accuracy: 90.3,
    precision: 91.8,
    recall: 89.7,
    f1Score: 90.7,
  })

  const [isTraining, setIsTraining] = useState(false)
  const [systemLoad, setSystemLoad] = useState(42)
  const [activeSensors, setActiveSensors] = useState(47)
  const [detectionsToday, setDetectionsToday] = useState(1247)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())

      // Simulate system load changes
      setSystemLoad((prev) => Math.max(5, Math.min(95, prev + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 5)))

      // Occasionally add new detections
      if (Math.random() > 0.95) {
        const newDetection: Detection = {
          id: `det_${Date.now()}`,
          location: {
            lat: -11.2 + (Math.random() - 0.5) * 0.1,
            lng: 17.87 + (Math.random() - 0.5) * 0.1,
          },
          confidence: 0.7 + Math.random() * 0.3,
          timestamp: new Date().toISOString(),
          risk_level: Math.random() > 0.7 ? "high" : Math.random() > 0.4 ? "medium" : "low",
          species: Math.random() > 0.5 ? "Mastomys natalensis" : "Mastomys erythroleucus",
        }
        setRecentDetections((prev) => [newDetection, ...prev.slice(0, 4)])
        setDetectionsToday((prev) => prev + 1)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const triggerTraining = async () => {
    setIsTraining(true)

    // Simulate training process
    setTimeout(() => {
      setMLMetrics((prev) => ({
        accuracy: Math.min(99.9, prev.accuracy + Math.random() * 2),
        precision: Math.min(99.9, prev.precision + Math.random() * 1.5),
        recall: Math.min(99.9, prev.recall + Math.random() * 1.8),
        f1Score: Math.min(99.9, prev.f1Score + Math.random() * 1.6),
      }))
      setIsTraining(false)
    }, 3000)
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      // Simulate data refresh
      setActiveSensors((prev) => prev + Math.floor((Math.random() - 0.5) * 4))
    }, 1000)
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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MNTRK Sovereign Observatory
            </h1>
            <p className="text-gray-400">Bio-Intelligence Command Center • Real-time Mastomys Surveillance</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentTime.toLocaleTimeString()}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
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
                  <div className="text-xs text-gray-400 mt-1">Response: 42ms</div>
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
                  <div className="text-xs text-gray-400 mt-1">Sync: Active</div>
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
                  <div className={`flex items-center ${getStatusColor(isTraining ? "training" : systemStatus.ml)}`}>
                    {getStatusIcon(isTraining ? "training" : systemStatus.ml)}
                    <span className="ml-2 capitalize">{isTraining ? "training" : systemStatus.ml}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Accuracy: {mlMetrics.accuracy.toFixed(1)}%</div>
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
                  <div className="text-xs text-gray-400 mt-1">Query: {"< 50ms"}</div>
                </CardContent>
              </Card>
            </div>

            {/* System Load and Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      System Load
                    </div>
                    <Badge
                      className={systemLoad > 80 ? "bg-red-500" : systemLoad > 60 ? "bg-yellow-500" : "bg-green-500"}
                    >
                      {systemLoad.toFixed(0)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={systemLoad} className="h-2" />
                  <div className="text-xs text-gray-400 mt-2">CPU, Memory, Network utilization</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Network Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-400">{activeSensors}</div>
                      <div className="text-xs text-gray-400">Active Sensors</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-400">{detectionsToday}</div>
                      <div className="text-xs text-gray-400">Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-400">12</div>
                      <div className="text-xs text-gray-400">Alerts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Detection Feed */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Real-time Detection Feed
                  </div>
                  <Badge className="bg-blue-600">{recentDetections.length} recent</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDetections.map((detection) => (
                    <div key={detection.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={getRiskBadgeColor(detection.risk_level)}>
                          {detection.risk_level.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">
                            {detection.species} detected at {detection.location.lat.toFixed(4)},{" "}
                            {detection.location.lng.toFixed(4)}
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
                  ))}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">{activeSensors}</div>
                    <div className="text-sm text-gray-400">Active Sensors</div>
                    <div className="text-xs text-gray-500 mt-1">98.7% uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{detectionsToday.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Detections Today</div>
                    <div className="text-xs text-gray-500 mt-1">+12% from yesterday</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">12</div>
                    <div className="text-sm text-gray-400">High Risk Areas</div>
                    <div className="text-xs text-gray-500 mt-1">Requires attention</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Geographic Coverage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium">Northern Sector</div>
                      <div className="text-xs text-gray-400">15 sensors • 89% coverage</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium">Southern Sector</div>
                      <div className="text-xs text-gray-400">18 sensors • 94% coverage</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium">Eastern Sector</div>
                      <div className="text-xs text-gray-400">8 sensors • 76% coverage</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium">Western Sector</div>
                      <div className="text-xs text-gray-400">6 sensors • 68% coverage</div>
                    </div>
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

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Model Status</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-sm font-medium">Habitat Predictor</div>
                      <div className="text-xs text-green-400">91.2% accuracy</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-sm font-medium">Movement Predictor</div>
                      <div className="text-xs text-blue-400">87.8% accuracy</div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded text-center">
                      <div className="text-sm font-medium">Anomaly Detector</div>
                      <div className="text-xs text-yellow-400">93.1% accuracy</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={triggerTraining} disabled={isTraining}>
                    {isTraining ? (
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    )}
                    {isTraining ? "Training in Progress..." : "Trigger Training"}
                  </Button>
                  <Button variant="outline" className="border-gray-600">
                    View Model Details
                  </Button>
                  <Button variant="outline" className="border-gray-600">
                    Export Metrics
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
                        <span>User Identity</span>
                        <span className="text-green-400">12.3K profiles</span>
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
                        <span>Environmental Data</span>
                        <span className="text-blue-400">3.4M readings</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Query Performance</span>
                        <span className="text-blue-400">{"< 50ms avg"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Data Pipeline Health</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">99.8%</div>
                      <div className="text-xs text-gray-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">2.3TB</div>
                      <div className="text-xs text-gray-400">Data Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">47ms</div>
                      <div className="text-xs text-gray-400">Avg Latency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">156</div>
                      <div className="text-xs text-gray-400">API Calls/min</div>
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
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage API Keys
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <Activity className="w-4 h-4 mr-2" />
                    System Logs
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    User Management
                  </Button>
                  <Button className="bg-gray-700 hover:bg-gray-600">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Settings
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">System Information</h3>
                  <div className="bg-gray-700 p-4 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Version:</span>
                        <span className="ml-2">MNTRK v2.1.0</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Build:</span>
                        <span className="ml-2">20241201-1847</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Environment:</span>
                        <span className="ml-2">Production</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Region:</span>
                        <span className="ml-2">us-central1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
