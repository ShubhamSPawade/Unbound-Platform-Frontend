"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, DollarSign, Trophy, Plus, TrendingUp, BookOpen, LogOut, Edit } from "lucide-react"
import { api, type Event, type Fest, type DashboardStats } from "@/lib/api"
import { getAuthState, clearAuthState } from "@/lib/auth"
import { uiLogger } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CollegeDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [fests, setFests] = useState<Fest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateFest, setShowCreateFest] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const router = useRouter()
  const { user } = getAuthState()

  // Form states
  const [festForm, setFestForm] = useState({
    fname: "",
    fdescription: "",
    startDate: "",
    endDate: "",
    city: "",
    state: "",
    country: "India",
    mode: "Offline" as "Online" | "Offline" | "Hybrid",
    website: "",
    contactPhone: "",
  })

  const [eventForm, setEventForm] = useState({
    ename: "",
    edescription: "",
    eventDate: "",
    fees: 0,
    location: "",
    capacity: 100,
    teamIsAllowed: false,
    category: "Technical",
    mode: "Offline" as "Online" | "Offline" | "Hybrid",
    fid: "",
    cashPrize: "",
    firstPrize: "",
    secondPrize: "",
    thirdPrize: "",
    city: "",
    state: "",
    country: "India",
    eventWebsite: "",
    contactPhone: "",
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    rules: "",
    requirements: "",
    registrationDeadline: "",
  })

  useEffect(() => {
    if (!user || user.role !== "College") {
      router.push("/auth/login")
      return
    }

    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      uiLogger.info("Loading college dashboard data")
      
      const [statsData, eventsData, festsData] = await Promise.all([
        api.getCollegeStats(),
        api.getCollegeEvents(),
        api.getFests(),
      ])
      
      uiLogger.debug("API responses received", { 
        stats: statsData, 
        events: eventsData, 
        fests: festsData 
      })
      
      setStats(statsData.data as DashboardStats || {})
      setEvents(eventsData.data as Event[] || [])
      setFests(festsData.data as Fest[] || [])
    } catch (err) {
      console.error("Dashboard data error:", err)
      uiLogger.error("Failed to load dashboard data", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      // Set fallback data
      setStats({})
      setEvents([])
      setFests([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthState()
    router.push("/")
  }

  const handleCreateFest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createFest(festForm)
      setShowCreateFest(false)
      setFestForm({
        fname: "",
        fdescription: "",
        startDate: "",
        endDate: "",
        city: "",
        state: "",
        country: "India",
        mode: "Offline",
        website: "",
        contactPhone: "",
      })
      loadDashboardData()
      alert("Fest created successfully! It will be reviewed by admin.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fest")
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const eventData = {
        ...eventForm,
        fid: eventForm.fid ? Number.parseInt(eventForm.fid) : undefined,
      }
      await api.createEvent(eventData)
      setShowCreateEvent(false)
      setEventForm({
        ename: "",
        edescription: "",
        eventDate: "",
        fees: 0,
        location: "",
        capacity: 100,
        teamIsAllowed: false,
        category: "Technical",
        mode: "Offline",
        fid: "",
        cashPrize: "",
        firstPrize: "",
        secondPrize: "",
        thirdPrize: "",
        city: "",
        state: "",
        country: "India",
        eventWebsite: "",
        contactPhone: "",
        organizerName: "",
        organizerEmail: "",
        organizerPhone: "",
        rules: "",
        requirements: "",
        registrationDeadline: "",
      })
      loadDashboardData()
      alert("Event created successfully! It will be reviewed by admin.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500"
      case "Pending":
        return "bg-yellow-500"
      case "Rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
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
            <h1 className="text-2xl font-bold gradient-text">College Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.cname}!</p>
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
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
              <p className="text-xs text-muted-foreground">Events created</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRegistrations || 0}</div>
              <p className="text-xs text-muted-foreground">Student registrations</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.totalEarnings || 0}</div>
              <p className="text-xs text-muted-foreground">Registration fees</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting admin review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="fests">My Fests</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Events</CardTitle>
                    <CardDescription>Manage your events and track registrations</CardDescription>
                  </div>
                  <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>Fill in the details to create a new event</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="ename">Event Name</Label>
                            <Input
                              id="ename"
                              value={eventForm.ename}
                              onChange={(e) => setEventForm((prev) => ({ ...prev, ename: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={eventForm.category}
                              onValueChange={(value) => setEventForm((prev) => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Technical">Technical</SelectItem>
                                <SelectItem value="Cultural">Cultural</SelectItem>
                                <SelectItem value="Sports">Sports</SelectItem>
                                <SelectItem value="Management">Management</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edescription">Description</Label>
                          <Textarea
                            id="edescription"
                            value={eventForm.edescription}
                            onChange={(e) => setEventForm((prev) => ({ ...prev, edescription: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="eventDate">Event Date</Label>
                            <Input
                              id="eventDate"
                              type="date"
                              value={eventForm.eventDate}
                              onChange={(e) => setEventForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                            <Input
                              id="registrationDeadline"
                              type="date"
                              value={eventForm.registrationDeadline}
                              onChange={(e) =>
                                setEventForm((prev) => ({ ...prev, registrationDeadline: e.target.value }))
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fees">Registration Fee (₹)</Label>
                            <Input
                              id="fees"
                              type="number"
                              value={eventForm.fees}
                              onChange={(e) =>
                                setEventForm((prev) => ({ ...prev, fees: Number.parseInt(e.target.value) || 0 }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={eventForm.capacity}
                              onChange={(e) =>
                                setEventForm((prev) => ({ ...prev, capacity: Number.parseInt(e.target.value) || 100 }))
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mode">Mode</Label>
                            <Select
                              value={eventForm.mode}
                              onValueChange={(value: "Online" | "Offline" | "Hybrid") =>
                                setEventForm((prev) => ({ ...prev, mode: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              value={eventForm.location}
                              onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="fid">Associate with Fest (Optional)</Label>
                            <Select
                              value={eventForm.fid}
                              onValueChange={(value) => setEventForm((prev) => ({ ...prev, fid: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a fest" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Fest (Standalone Event)</SelectItem>
                                {(fests || []).map((fest, index) => (
                                  <SelectItem key={fest.id || `fest-${index}`} value={fest.id?.toString() || ""}>
                                    {fest.fname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="teamIsAllowed"
                            checked={eventForm.teamIsAllowed}
                            onChange={(e) => setEventForm((prev) => ({ ...prev, teamIsAllowed: e.target.checked }))}
                          />
                          <Label htmlFor="teamIsAllowed">Allow team participation</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowCreateEvent(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create Event</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {(events || []).length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first event to get started!</p>
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(events || []).map((event, index) => (
                      <Card key={event.id || `${event.ename}-${index}`} className="card-hover">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{event.ename}</h3>
                                <Badge className={`${getStatusColor(event.status)} text-white`}>
                                  {event.status || "Pending"}
                                </Badge>
                                <Badge variant="outline">{event.category}</Badge>
                              </div>

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
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span>₹{event.fees}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span>{event.capacity} seats</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline">
                                View Registrations
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

          <TabsContent value="fests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Fests</CardTitle>
                    <CardDescription>Manage your fests and associated events</CardDescription>
                  </div>
                  <Dialog open={showCreateFest} onOpenChange={setShowCreateFest}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Fest
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Fest</DialogTitle>
                        <DialogDescription>Fill in the details to create a new fest</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateFest} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fname">Fest Name</Label>
                          <Input
                            id="fname"
                            value={festForm.fname}
                            onChange={(e) => setFestForm((prev) => ({ ...prev, fname: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fdescription">Description</Label>
                          <Textarea
                            id="fdescription"
                            value={festForm.fdescription}
                            onChange={(e) => setFestForm((prev) => ({ ...prev, fdescription: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={festForm.startDate}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, startDate: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={festForm.endDate}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, endDate: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={festForm.city}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, city: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={festForm.state}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mode">Mode</Label>
                            <Select
                              value={festForm.mode}
                              onValueChange={(value: "Online" | "Offline" | "Hybrid") =>
                                setFestForm((prev) => ({ ...prev, mode: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Online">Online</SelectItem>
                                <SelectItem value="Offline">Offline</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="website">Website (Optional)</Label>
                            <Input
                              id="website"
                              type="url"
                              value={festForm.website}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, website: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Contact Phone</Label>
                            <Input
                              id="contactPhone"
                              value={festForm.contactPhone}
                              onChange={(e) => setFestForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowCreateFest(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create Fest</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {(fests || []).length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No fests yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first fest to organize multiple events!</p>
                    <Button onClick={() => setShowCreateFest(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Fest
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(fests || []).map((fest, index) => (
                      <Card key={fest.id || `${fest.fname}-${index}`} className="card-hover">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{fest.fname}</h3>
                                <Badge className={`${getStatusColor(fest.status)} text-white`}>
                                  {fest.status || "Pending"}
                                </Badge>
                              </div>

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
                                  <Badge variant="outline">{fest.mode}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline">
                                View Events
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
      </div>
    </div>
  )
}
