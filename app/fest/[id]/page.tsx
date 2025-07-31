"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Calendar, Users, Clock, Heart, Share2, Trophy, Globe, Code, Music, Palette } from "lucide-react"
import { authService } from "@/lib/auth"
import Link from "next/link"
import { motion } from "framer-motion"

interface FestDetails {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  mode: "Online" | "Offline" | "Hybrid"
  image: string
  website?: string
  college: {
    id: string
    name: string
    location: string
    email: string
    phone: string
    website?: string
  }
  organizer: {
    name: string
    email: string
    phone: string
  }
  eventCount: number
  events: Array<{
    id: string
    name: string
    description: string
    category: string
    fees: number
    eventDate: string
    registrationCount: number
    maxParticipants: number
    image: string
    daysLeft: number
  }>
  stats: {
    totalParticipants: number
    totalPrizes: string
    totalEvents: number
  }
}

export default function FestDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [fest, setFest] = useState<FestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")
  const [isSaved, setIsSaved] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const user = authService.getCurrentUser()
  const festId = params.id as string

  useEffect(() => {
    fetchFestDetails()
  }, [festId])

  const fetchFestDetails = async () => {
    try {
      setLoading(true)

      // Mock fest data - in real app, this would come from API
      const mockFest: FestDetails = {
        id: festId,
        name: "Cultural Extravaganza 2024",
        description: "Celebrate diversity through dance, music, drama and art competitions",
        startDate: "2024-04-20",
        endDate: "2024-04-22",
        location: "Delhi",
        mode: "Hybrid",
        image: "/images/fest-hero.png",
        website: "https://culturalextravaganza.edu",
        college: {
          id: "1",
          name: "Arts College Delhi",
          location: "Delhi",
          email: "events@artscollegedelhi.edu",
          phone: "+91-9876543211",
          website: "https://artscollegedelhi.edu",
        },
        organizer: {
          name: "Dr. Priya Sharma",
          email: "priya.sharma@artscollegedelhi.edu",
          phone: "+91-9876543211",
        },
        eventCount: 8,
        events: [
          {
            id: "1",
            name: "Dance Battle",
            description: "Inter-college dance competition showcasing various dance forms",
            category: "Cultural",
            fees: 300,
            eventDate: "2024-04-21",
            registrationCount: 40,
            maxParticipants: 80,
            image: "/placeholder.svg?height=200&width=300",
            daysLeft: 25,
          },
        ],
        stats: {
          totalParticipants: 500,
          totalPrizes: "₹2,00,000",
          totalEvents: 8,
        },
      }

      setFest(mockFest)
    } catch (error) {
      console.error("Error fetching fest details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: fest?.name,
        text: fest?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!fest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Fest not found</h2>
          <Link href="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
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
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <Link href={authService.getRedirectPath(user.role)}>
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden mb-8"
            >
              <div className="aspect-video w-full">
                <img src={fest.image || "/placeholder.svg"} alt={fest.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badge */}
              <div className="absolute top-6 left-6">
                <Badge className="bg-purple-600 text-white px-3 py-1 text-sm font-medium">{fest.mode}</Badge>
              </div>

              {/* Key Information Overlay */}
              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl font-bold mb-4">{fest.name}</h1>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(fest.startDate).toLocaleDateString()} - {new Date(fest.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{getDuration(fest.startDate, fest.endDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>{fest.eventCount} events</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="events">Events ({fest.events.length})</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fest Events</CardTitle>
                    <CardDescription>Discover all the exciting events happening during {fest.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {fest.events.map((event) => (
                        <Link key={event.id} href={`/event/${event.id}`}>
                          <Card className="card-hover cursor-pointer overflow-hidden">
                            <div className="relative">
                              <div className="aspect-[5/2] w-full">
                                <img
                                  src="/placeholder.svg?height=200&width=500"
                                  alt={event.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                              {/* Event Badge */}
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-orange-600 text-white px-2 py-1 text-xs">{event.category}</Badge>
                              </div>

                              {/* Days Left Badge */}
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-green-600 text-white px-2 py-1 text-xs">
                                  {event.daysLeft} days left
                                </Badge>
                              </div>

                              {/* Price */}
                              <div className="absolute bottom-4 left-4 text-white">
                                <div className="text-2xl font-bold">₹{event.fees}</div>
                              </div>

                              {/* Event Title */}
                              <div className="absolute bottom-4 right-4 text-white text-right">
                                <h3 className="text-xl font-bold">{event.name}</h3>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <p className="text-muted-foreground text-sm mb-3">{event.description}</p>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{event.registrationCount} registered</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {fest.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{fest.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Schedule</CardTitle>
                    <CardDescription>Complete timeline of all events during the fest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Schedule details coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fest Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{fest.name}</CardTitle>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Ongoing
                    </Badge>
                  </div>
                  <CardDescription>{fest.college.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{getDuration(fest.startDate, fest.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Events:</span>
                      <span>{fest.eventCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <span>{fest.mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{fest.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleSave}>
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {fest.website && (
                    <Button className="w-full bg-black hover:bg-black/90 text-white">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Explore Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explore Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={selectedCategory === "technical" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory("technical")}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Technical Events
                  </Button>
                  <Button
                    variant={selectedCategory === "cultural" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory("cultural")}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Cultural Events
                  </Button>
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory("all")}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    All Events
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
