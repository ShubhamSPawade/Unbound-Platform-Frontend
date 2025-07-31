"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowLeft, Calendar, Users, Clock, Star, Heart, Share2, Trophy, User, CheckCircle, Award } from "lucide-react"
import { authService } from "@/lib/auth"
import Link from "next/link"
import { motion } from "framer-motion"

interface EventDetails {
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
  image: string
  location: string
  duration: string
  rating: number
  totalReviews: number
  college: {
    id: string
    name: string
    location: string
    email: string
    phone: string
    website?: string
  }
  fest?: {
    id: string
    name: string
    description: string
  }
  organizer: {
    name: string
    email: string
    phone: string
  }
  rules: string[]
  requirements: string[]
  prizes: {
    first: string
    second: string
    third: string
    other?: string
  }
  aboutEvent: string
  teamAllowed: boolean
  reviews: Array<{
    id: string
    userName: string
    rating: number
    comment: string
    date: string
  }>
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<EventDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [isSaved, setIsSaved] = useState(false)

  const user = authService.getCurrentUser()
  const eventId = params.id as string

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      setLoading(true)

      // Mock event data - in real app, this would come from API
      const mockEvent: EventDetails = {
        id: eventId,
        name: "Dance Battle",
        description: "Inter-college dance competition showcasing various dance forms",
        category: "Cultural",
        mode: "offline",
        fees: 300,
        maxParticipants: 80,
        registrationCount: 40,
        registrationDeadline: "2024-04-15",
        eventDate: "2024-04-21",
        image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-f20V3X416eqHAi1AoU8g16Slz5tCd8.png",
        location: "Cultural Hall, Delhi",
        duration: "3 hours",
        rating: 4.5,
        totalReviews: 24,
        college: {
          id: "1",
          name: "Arya College Delhi",
          location: "New Delhi",
          email: "events@aryacollege.edu",
          phone: "+91-9876543212",
          website: "https://aryacollege.edu",
        },
        fest: {
          id: "1",
          name: "Cultural Extravaganza 2024",
          description: "Annual cultural festival celebrating arts and creativity",
        },
        organizer: {
          name: "Jane Smith",
          email: "jane.smith@aryacollege.edu",
          phone: "+91-9876543212",
        },
        rules: [
          "Teams of 4-8 members allowed",
          "Performance duration: 5-8 minutes",
          "Original choreography preferred",
          "Appropriate costumes mandatory",
          "No offensive content allowed",
        ],
        requirements: ["Dance costumes", "College ID", "Music tracks (USB/CD)", "Registration confirmation"],
        prizes: {
          first: "₹15,000 + Trophy",
          second: "₹10,000 + Trophy",
          third: "₹5,000 + Trophy",
          other: "Participation certificates for all",
        },
        aboutEvent:
          "Inter-college dance competition showcasing various dance forms including classical, contemporary, hip-hop, and folk dances. This prestigious event brings together the best dance talents from colleges across Delhi NCR.",
        teamAllowed: true,
        reviews: [
          {
            id: "1",
            userName: "Priya Sharma",
            rating: 5,
            comment: "Amazing event! Great organization and fantastic prizes.",
            date: "2024-01-15",
          },
          {
            id: "2",
            userName: "Rahul Kumar",
            rating: 4,
            comment: "Well organized event with good facilities.",
            date: "2024-01-10",
          },
        ],
      }

      setEvent(mockEvent)
    } catch (error) {
      console.error("Error fetching event details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    // Handle registration logic
    console.log("Register for event:", eventId)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: event?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getDaysLeft = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getSpotsLeft = (max: number, registered: number) => {
    return Math.max(0, max - registered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
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
              <div className="text-sm text-muted-foreground">
                <Link href="/explore" className="hover:text-foreground">
                  Explore
                </Link>
                <span className="mx-2">/</span>
                <Link href="/explore" className="hover:text-foreground">
                  Events
                </Link>
                <span className="mx-2">/</span>
                <span>{event.name}</span>
              </div>
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
                <img src={event.image || "/placeholder.svg"} alt={event.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <Badge variant="secondary" className="mb-2">
                  {event.category}
                </Badge>
                <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {getDaysLeft(event.registrationDeadline)} days left
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {event.registrationCount} registered
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="prizes">Prizes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({event.totalReviews})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{event.aboutEvent}</p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Event Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{event.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span>{event.maxParticipants} participants</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Team allowed:</span>
                        <span>{event.teamAllowed ? "Yes" : "No"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Organizer Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">College:</span>
                        <span>{event.college.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact:</span>
                        <span>{event.organizer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <a href={`mailto:${event.organizer.email}`} className="text-primary hover:underline">
                          {event.organizer.email}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <a href={`tel:${event.organizer.phone}`} className="text-primary hover:underline">
                          {event.organizer.phone}
                        </a>
                      </div>
                      {event.college.website && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Website:</span>
                          <a
                            href={event.college.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Event Website
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {event.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Rules</CardTitle>
                    <CardDescription>Please read and follow all rules carefully</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {event.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prizes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Prize Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-yellow-600" />
                          <span className="font-semibold">1st Prize</span>
                        </div>
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{event.prizes.first}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-gray-600" />
                          <span className="font-semibold">2nd Prize</span>
                        </div>
                        <span className="font-bold text-gray-700 dark:text-gray-400">{event.prizes.second}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                          <Award className="w-6 h-6 text-orange-600" />
                          <span className="font-semibold">3rd Prize</span>
                        </div>
                        <span className="font-bold text-orange-700 dark:text-orange-400">{event.prizes.third}</span>
                      </div>
                      {event.prizes.other && (
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <Award className="w-6 h-6 text-muted-foreground" />
                            <span className="font-semibold">Other Prizes</span>
                          </div>
                          <span className="font-bold">{event.prizes.other}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Reviews & Ratings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(event.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{event.rating}</span>
                      <span className="text-muted-foreground">({event.totalReviews} reviews)</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{review.userName}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="text-3xl font-bold">₹{event.fees}</div>
                    <div className="text-sm text-muted-foreground">Registration Fee</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{getSpotsLeft(event.maxParticipants, event.registrationCount)} spots left</span>
                    <span>Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleRegister}
                    disabled={getSpotsLeft(event.maxParticipants, event.registrationCount) === 0}
                  >
                    {user ? "Register Now" : "Login to Register"}
                  </Button>
                  {!user && (
                    <p className="text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Link href="/auth/register" className="text-primary hover:underline">
                        Sign up
                      </Link>
                    </p>
                  )}
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Part of Fest */}
            {event.fest && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Part of Fest</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Trophy className="w-8 h-8 text-primary" />
                      <div>
                        <div className="font-semibold">{event.fest.name}</div>
                        <div className="text-sm text-muted-foreground">{event.fest.description}</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-3 bg-transparent">
                      View Fest Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Event Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-semibold">{event.registrationCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-semibold">{event.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days Left</span>
                    <span className="font-semibold">{getDaysLeft(event.registrationDeadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{event.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
