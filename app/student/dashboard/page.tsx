"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, Trophy, Users, Download, LogOut, User, Clock, CheckCircle, XCircle, Zap } from "lucide-react"
import { authService } from "@/lib/auth"
import { apiClient } from "@/lib/api"
import { uiLogger } from "@/lib/utils"
import Link from "next/link"

interface DashboardData {
  stats: {
    totalRegistrations: number
    approvedRegistrations: number
    pendingRegistrations: number
    totalCertificates: number
  }
  recentRegistrations: Array<{
    id: string
    eventName: string
    festName?: string
    collegeName: string
    registrationDate: string
    status: "pending" | "approved" | "rejected"
    paymentStatus: "pending" | "completed" | "failed"
    teamName?: string
    certificateAvailable: boolean
  }>
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getCurrentUser())
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "Student") {
      uiLogger.warn("User not authenticated or not a student", { user })
      router.push("/auth/login")
      return
    }

    uiLogger.info("Loading student dashboard", { email: user.email, role: user.role })
    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      const response = await apiClient.getStudentDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data as DashboardData)
      } else {
        // Provide fallback data for testing
        setDashboardData({
          stats: {
            totalRegistrations: 0,
            approvedRegistrations: 0,
            pendingRegistrations: 0,
            totalCertificates: 0
          },
          recentRegistrations: []
        })
        setError("No dashboard data available yet")
      }
    } catch (error: any) {
      console.error("Dashboard error:", error)
      // Provide fallback data for testing
      setDashboardData({
        stats: {
          totalRegistrations: 0,
          approvedRegistrations: 0,
          pendingRegistrations: 0,
          totalCertificates: 0
        },
        recentRegistrations: []
      })
      setError("Failed to load dashboard data. You can still explore events.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const handleDownloadCertificate = async (registrationId: string) => {
    try {
      const response = await apiClient.downloadCertificate(registrationId)
      if (response.success && response.data) {
        // Handle certificate download
        window.open((response.data as any).certificateUrl, "_blank")
      }
    } catch (error: any) {
      setError(error.message || "Failed to download certificate")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Paid
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold gradient-text">Unbound</span>
              </Link>
              <Badge variant="outline" className="hidden sm:flex">
                <User className="w-3 h-3 mr-1" />
                Student
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {user?.sname || user?.email}</span>
              <Link href="/explore">
                <Button variant="ghost" size="sm">
                  Explore Events
                </Button>
              </Link>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.sname || user?.email}!</h1>
          <p className="text-muted-foreground">
            Track your registrations, download certificates, and discover new events.
          </p>
        </div>

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalRegistrations}</div>
                <p className="text-xs text-muted-foreground">Events you've registered for</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{dashboardData.stats.approvedRegistrations}</div>
                <p className="text-xs text-muted-foreground">Confirmed registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboardData.stats.pendingRegistrations}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.totalCertificates}</div>
                <p className="text-xs text-muted-foreground">Available for download</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registrations">My Registrations</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>Your latest event registrations and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
                    <p className="text-muted-foreground mb-4">Start by exploring and registering for events</p>
                    <Link href="/explore">
                      <Button>Explore Events</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.recentRegistrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{registration.eventName}</h4>
                            {registration.teamName && (
                              <Badge variant="outline">
                                <Users className="w-3 h-3 mr-1" />
                                {registration.teamName}
                              </Badge>
                            )}
                          </div>
                          {registration.festName && (
                            <p className="text-sm text-muted-foreground mb-1">Part of {registration.festName}</p>
                          )}
                          <p className="text-sm text-muted-foreground mb-2">
                            {registration.collegeName} • Registered on{" "}
                            {new Date(registration.registrationDate).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(registration.status)}
                            {getPaymentStatusBadge(registration.paymentStatus)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {registration.certificateAvailable && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadCertificate(registration.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Certificate
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Certificates</CardTitle>
                <CardDescription>Download your participation and achievement certificates</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentRegistrations.filter((r) => r.certificateAvailable).length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No certificates available</h3>
                    <p className="text-muted-foreground">
                      Certificates will appear here once your registrations are approved
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboardData?.recentRegistrations
                      .filter((r) => r.certificateAvailable)
                      .map((registration) => (
                        <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{registration.eventName}</h4>
                            <p className="text-sm text-muted-foreground">{registration.collegeName}</p>
                          </div>
                          <Button size="sm" onClick={() => handleDownloadCertificate(registration.id)}>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
