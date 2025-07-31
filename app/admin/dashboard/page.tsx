"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  MapPin,
  Users,
  Building,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  AlertTriangle,
} from "lucide-react"
import { api, type Event, type Fest, type DashboardStats } from "@/lib/api"
import { getAuthState, clearAuthState } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  const [pendingFests, setPendingFests] = useState<Fest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedItem, setSelectedItem] = useState<{ type: "event" | "fest"; item: Event | Fest } | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const router = useRouter()
  const { user } = getAuthState()

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      router.push("/auth/login")
      return
    }

    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const [statsData, eventsData, festsData] = await Promise.all([
        api.getAdminStats(),
        api.getPendingEvents(),
        api.getPendingFests(),
      ])
      setStats(statsData)
      setPendingEvents(eventsData)
      setPendingFests(festsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthState()
    router.push("/")
  }

  const handleApprove = async (type: "event" | "fest", id: number) => {
    try {
      if (type === "event") {
        await api.approveEvent(id)
        setPendingEvents((prev) => prev.filter((item) => item.id !== id))
      } else {
        await api.approveFest(id)
        setPendingFests((prev) => prev.filter((item) => item.id !== id))
      }
      alert(`${type} approved successfully!`)
      loadDashboardData()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to approve ${type}`)
    }
  }

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) return

    try {
      if (selectedItem.type === "event") {
        await api.rejectEvent(selectedItem.item.id, rejectReason)
        setPendingEvents((prev) => prev.filter((item) => item.id !== selectedItem.item.id))
      } else {
        await api.rejectFest(selectedItem.item.id, rejectReason)
        setPendingFests((prev) => prev.filter((item) => item.id !== selectedItem.item.id))
      }
      setShowRejectDialog(false)
      setSelectedItem(null)
      setRejectReason("")
      alert(`${selectedItem.type} rejected successfully!`)
      loadDashboardData()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to reject ${selectedItem.type}`)
    }
  }

  const openRejectDialog = (type: "event" | "fest", item: Event | Fest) => {
    setSelectedItem({ type, item })
    setShowRejectDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform administration and moderation</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalColleges || 0}</div>
              <p className="text-xs text-muted-foreground">Registered colleges</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">Active students</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">Platform events</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingEvents.length + pendingFests.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending-events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending-events">Pending Events ({pendingEvents.length})</TabsTrigger>
            <TabsTrigger value="pending-fests">Pending Fests ({pendingFests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Event Approvals</CardTitle>
                <CardDescription>Review and approve or reject events submitted by colleges</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending events to review at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEvents.map((event, index) => (
                      <Card key={event.id || `${event.ename}-${index}`} className="card-hover border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{event.ename}</h3>
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Review
                                </Badge>
                                <Badge variant="outline">{event.category}</Badge>
                              </div>

                              {event.college && (
                                <p className="text-sm text-muted-foreground mb-2">by {event.college.cname}</p>
                              )}

                              <p className="text-muted-foreground mb-4">{event.edescription}</p>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{formatDate(event.eventDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    ₹{event.fees} • {event.capacity} seats
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{event.mode}</Badge>
                                  {event.teamIsAllowed && <Badge variant="secondary">Team Allowed</Badge>}
                                </div>
                              </div>

                              {event.rules && (
                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                  <h4 className="font-medium mb-2">Rules:</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.rules}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApprove("event", event.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => openRejectDialog("event", event)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-fests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Fest Approvals</CardTitle>
                <CardDescription>Review and approve or reject fests submitted by colleges</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingFests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending fests to review at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFests.map((fest, index) => (
                      <Card key={fest.id || `${fest.fname}-${index}`} className="card-hover border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{fest.fname}</h3>
                                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Review
                                </Badge>
                              </div>

                              {fest.college && (
                                <p className="text-sm text-muted-foreground mb-2">by {fest.college.cname}</p>
                              )}

                              <p className="text-muted-foreground mb-4">{fest.fdescription}</p>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {formatDate(fest.startDate)} - {formatDate(fest.endDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {fest.city}, {fest.state}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{fest.mode}</Badge>
                                </div>
                              </div>

                              {fest.website && (
                                <div className="mt-2">
                                  <a
                                    href={fest.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline text-sm"
                                  >
                                    Visit Website →
                                  </a>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => handleApprove("fest", fest.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => openRejectDialog("fest", fest)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Reject {selectedItem?.type}
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this {selectedItem?.type}. This will be sent to the college for
                their reference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
                  Reject {selectedItem?.type}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
