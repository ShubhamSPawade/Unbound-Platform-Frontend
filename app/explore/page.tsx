"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, MapPin, Calendar, Clock, Zap, Users } from "lucide-react"
import { apiClient } from "@/lib/api"
import { authService } from "@/lib/auth"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface Event {
  id: string
  name: string
  description: string
  category: string
  mode: "online" | "offline"
  fees: number
  maxParticipants: number
  registrationCount: number
  registrationDeadline: string
  eventDate: string
  image?: string
  college: {
    id: string
    name: string
    location: string
  }
  fest?: {
    id: string
    name: string
  }
}

interface Fest {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  website?: string
  image?: string
  college: {
    id: string
    name: string
    location: string
  }
  eventCount: number
}

export default function ExplorePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [fests, setFests] = useState<Fest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [modeFilter, setModeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  const user = authService.getCurrentUser()

  useEffect(() => {
    fetchEvents()
    fetchFests()
  }, [searchQuery, categoryFilter, modeFilter, dateFilter, currentPage])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // Set fallback data immediately to prevent empty states
      const fallbackEvents = [
        {
          id: "1",
          name: "CodeFest 2024",
          description: "Annual coding competition with exciting challenges and prizes worth ₹50,000",
          category: "Programming",
          mode: "online" as const,
          fees: 0,
          maxParticipants: 500,
          registrationCount: 245,
          registrationDeadline: "2024-02-15",
          eventDate: "2024-02-20",
          image: "/placeholder.svg?height=300&width=500",
          college: {
            id: "1",
            name: "IIT Delhi",
            location: "New Delhi",
          },
        },
        {
          id: "2",
          name: "AI/ML Workshop",
          description: "Hands-on workshop on machine learning and artificial intelligence with industry experts",
          category: "AI/ML",
          mode: "offline" as const,
          fees: 299,
          maxParticipants: 200,
          registrationCount: 180,
          registrationDeadline: "2024-02-10",
          eventDate: "2024-02-18",
          image: "/placeholder.svg?height=300&width=500",
          college: {
            id: "2",
            name: "BITS Pilani",
            location: "Rajasthan",
          },
        },
      ]

      // Apply filters to fallback data
      let filteredEvents = fallbackEvents

      if (searchQuery) {
        filteredEvents = filteredEvents.filter(
          (event) =>
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.college.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      if (categoryFilter !== "all") {
        filteredEvents = filteredEvents.filter((event) => event.category === categoryFilter)
      }

      if (modeFilter !== "all") {
        filteredEvents = filteredEvents.filter((event) => event.mode === modeFilter)
      }

      // Set fallback data immediately
      setEvents(filteredEvents)
      setIsOfflineMode(true)
      setLoading(false)

      // Try API in background (optional)
      try {
        const params: any = {
          page: currentPage,
          limit: 12,
        }

        if (searchQuery) params.search = searchQuery
        if (categoryFilter !== "all") params.category = categoryFilter
        if (modeFilter !== "all") params.mode = modeFilter

        const response = await apiClient.getPublicEvents(params)

        if (response.success && response.data?.events) {
          // If API succeeds, replace with real data
          setEvents(response.data.events)
          setTotalPages(response.data.totalPages || 1)
          setIsOfflineMode(false)
        }
      } catch (apiError) {
        // API failed, but we already have fallback data loaded
        console.warn("API unavailable, using demo data:", apiError)
      }
    } catch (error) {
      console.error("Error in fetchEvents:", error)
      // Even if everything fails, set empty state
      setEvents([])
      setTotalPages(1)
      setIsOfflineMode(true)
      setLoading(false)
    }
  }

  const fetchFests = async () => {
    // Set fallback data immediately
    const fallbackFests = [
      {
        id: "1",
        name: "TechFest 2024",
        description: "Annual technical festival featuring coding competitions, hackathons, and tech talks",
        startDate: "2024-03-19",
        endDate: "2024-03-21",
        location: "Mumbai",
        image: "/placeholder.svg?height=300&width=500",
        college: {
          id: "1",
          name: "Tech University",
          location: "Mumbai",
        },
        eventCount: 5,
        website: "https://techfest.org",
      },
      {
        id: "2",
        name: "Cultural Extravaganza 2024",
        description: "Celebrate diversity through dance, music, drama and art competitions",
        startDate: "2024-04-20",
        endDate: "2024-04-22",
        location: "Delhi",
        image: "/placeholder.svg?height=300&width=500",
        college: {
          id: "2",
          name: "Arts College Delhi",
          location: "Delhi",
        },
        eventCount: 8,
      },
    ]

    // Apply filters to fallback data
    let filteredFests = fallbackFests

    if (searchQuery) {
      filteredFests = filteredFests.filter(
        (fest) =>
          fest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fest.college.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Set fallback data immediately
    setFests(filteredFests)

    // Try API in background (optional)
    try {
      const params: any = {
        page: 1,
        limit: 6,
      }

      if (searchQuery) params.search = searchQuery

      const response = await apiClient.getPublicFests(params)

      if (response.success && response.data?.fests) {
        // If API succeeds, replace with real data
        setFests(response.data.fests)
      }
    } catch (apiError) {
      // API failed, but we already have fallback data loaded
      console.warn("Fests API unavailable, using demo data:", apiError)
    }
  }

  const categories = [
    "Programming",
    "Web Development",
    "Mobile Development",
    "AI/ML",
    "Data Science",
    "Cybersecurity",
    "UI/UX Design",
    "Robotics",
    "IoT",
    "Blockchain",
    "Gaming",
    "Cultural",
    "Other",
  ]

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`
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
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link href={authService.getRedirectPath(user.role)}>
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {isOfflineMode && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertDescription className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>
                  <strong>Demo Mode:</strong> API server unavailable. Showing sample events and fests for demonstration.
                </span>
              </AlertDescription>
            </Alert>
          </motion.div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Events & Fests</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing events and fests happening across colleges. Find your next adventure!
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search events, fests, or colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-3xl mx-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12">
                <SelectValue placeholder="All Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48 h-12">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="events" className="text-base">
                Events ({events.length})
              </TabsTrigger>
              <TabsTrigger value="fests" className="text-base">
                Fests ({fests.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="events" className="space-y-8">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <div className="aspect-[5/3] bg-muted" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No events found</h3>
                <p className="text-muted-foreground text-lg">
                  Try adjusting your search criteria or check back later for new events.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
              >
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link href={`/event/${event.id}`}>
                      <Card className="card-hover overflow-hidden cursor-pointer group">
                        <div className="relative aspect-[5/3] overflow-hidden">
                          <img
                            src={event.image || "/placeholder.svg"}
                            alt={event.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-primary text-primary-foreground">Online</Badge>
                          </div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <div className="text-sm font-medium mb-1">{event.registrationCount} Events</div>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {event.name}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                              <Clock className="w-4 h-4 text-muted-foreground ml-4" />
                              <span>1 day</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{event.college.location}</span>
                              <Users className="w-4 h-4 text-muted-foreground ml-4" />
                              <span>{event.college.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.eventDate).toLocaleDateString()} -{" "}
                              {new Date(event.registrationDeadline).toLocaleDateString()}
                            </div>
                            <Button className="bg-black hover:bg-black/90 text-white">View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="fests" className="space-y-8">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="animate-pulse overflow-hidden">
                    <div className="aspect-[5/3] bg-muted" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : fests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">No fests found</h3>
                <p className="text-muted-foreground text-lg">
                  Try adjusting your search criteria or check back later for new fests.
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto"
              >
                {fests.map((fest, index) => (
                  <motion.div
                    key={fest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="card-hover overflow-hidden cursor-pointer group">
                      <div className="relative aspect-[5/3] overflow-hidden">
                        <img
                          src={fest.image || "/placeholder.svg"}
                          alt={fest.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-purple-600 text-white">Hybrid</Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-2xl font-bold mb-2">{fest.name}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>
                                {new Date(fest.startDate).toLocaleDateString()} -{" "}
                                {new Date(fest.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{getDuration(fest.startDate, fest.endDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{fest.eventCount} events</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4 line-clamp-2">{fest.description}</p>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{fest.location}</span>
                            <Users className="w-4 h-4 text-muted-foreground ml-4" />
                            <span>{fest.college.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {new Date(fest.startDate).toLocaleDateString()} -{" "}
                            {new Date(fest.endDate).toLocaleDateString()}
                          </div>
                          <Button className="bg-black hover:bg-black/90 text-white">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
