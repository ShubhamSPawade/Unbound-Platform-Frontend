"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Users, Trophy, MapPin, ArrowRight, Code, Zap, Globe, Award, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface Stats {
  totalEvents: number
  totalFests: number
  totalStudents: number
  totalColleges: number
}

interface FeaturedEvent {
  id: string
  name: string
  description: string
  category: string
  mode: string
  fees: number
  registrationCount: number
  maxParticipants: number
  college: {
    name: string
    location: string
  }
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalFests: 0,
    totalStudents: 0,
    totalColleges: 0,
  })
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      // Add timeout and better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        // Fetch public stats with timeout
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/stats`, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId)

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(
            statsData.data || {
              totalEvents: 150,
              totalFests: 45,
              totalStudents: 12500,
              totalColleges: 280,
            },
          )
        } else {
          throw new Error(`HTTP ${statsResponse.status}`)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.warn("Stats API unavailable, using fallback data:", fetchError)
        // Use fallback data when API is not available
        setStats({
          totalEvents: 150,
          totalFests: 45,
          totalStudents: 12500,
          totalColleges: 280,
        })
      }

      try {
        // Fetch featured events with timeout
        const controller2 = new AbortController()
        const timeoutId2 = setTimeout(() => controller2.abort(), 10000)

        const eventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/events?limit=6`, {
          signal: controller2.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId2)

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setFeaturedEvents(eventsData.data?.events || [])
        } else {
          throw new Error(`HTTP ${eventsResponse.status}`)
        }
      } catch (fetchError) {
        console.warn("Events API unavailable, using fallback data:", fetchError)
        // Use fallback featured events when API is not available
        setFeaturedEvents([
          {
            id: "1",
            name: "CodeFest 2024",
            description: "Annual coding competition with exciting challenges and prizes",
            category: "Programming",
            mode: "hybrid",
            fees: 0,
            registrationCount: 245,
            maxParticipants: 500,
            college: {
              name: "IIT Delhi",
              location: "New Delhi",
            },
          },
          {
            id: "2",
            name: "AI/ML Workshop",
            description: "Hands-on workshop on machine learning and artificial intelligence",
            category: "AI/ML",
            mode: "online",
            fees: 299,
            registrationCount: 180,
            maxParticipants: 200,
            college: {
              name: "BITS Pilani",
              location: "Rajasthan",
            },
          },
          {
            id: "3",
            name: "Web Dev Hackathon",
            description: "48-hour hackathon focused on web development technologies",
            category: "Web Development",
            mode: "offline",
            fees: 199,
            registrationCount: 156,
            maxParticipants: 300,
            college: {
              name: "NIT Trichy",
              location: "Tamil Nadu",
            },
          },
          {
            id: "4",
            name: "Cybersecurity Challenge",
            description: "Test your skills in ethical hacking and cybersecurity",
            category: "Cybersecurity",
            mode: "online",
            fees: 0,
            registrationCount: 89,
            maxParticipants: 150,
            college: {
              name: "IIIT Hyderabad",
              location: "Telangana",
            },
          },
          {
            id: "5",
            name: "Mobile App Contest",
            description: "Build innovative mobile applications and win exciting prizes",
            category: "Mobile Development",
            mode: "hybrid",
            fees: 149,
            registrationCount: 134,
            maxParticipants: 250,
            college: {
              name: "VIT Vellore",
              location: "Tamil Nadu",
            },
          },
          {
            id: "6",
            name: "UI/UX Design Sprint",
            description: "Design thinking workshop and UI/UX design competition",
            category: "UI/UX Design",
            mode: "offline",
            fees: 99,
            registrationCount: 67,
            maxParticipants: 100,
            college: {
              name: "MIT Manipal",
              location: "Karnataka",
            },
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      // Set fallback data for both stats and events
      setStats({
        totalEvents: 150,
        totalFests: 45,
        totalStudents: 12500,
        totalColleges: 280,
      })
      setFeaturedEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const features = [
    {
      icon: Code,
      title: "Tech Events",
      description: "Participate in coding competitions, hackathons, and technical workshops",
    },
    {
      icon: Users,
      title: "Team Building",
      description: "Form teams, collaborate with peers, and build lasting connections",
    },
    {
      icon: Trophy,
      title: "Competitions",
      description: "Compete in various categories and win exciting prizes and certificates",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with students and colleges from across India and beyond",
    },
    {
      icon: Award,
      title: "Certificates",
      description: "Earn verified certificates for your participation and achievements",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Safe and secure platform with verified colleges and events",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold gradient-text">Unbound</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
                Explore
              </Link>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">
                Login
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="btn-animate">
                  Get Started
                </Button>
              </Link>
              <ThemeToggle />
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              India's Largest <span className="gradient-text">Tech Fest</span> Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with top colleges, participate in exciting events, and showcase your skills on a national stage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/register">
                <Button size="lg" className="btn-animate shadow-glow">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="btn-animate bg-transparent">
                  Explore Events
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "..." : stats.totalEvents.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">Events</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "..." : stats.totalFests.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">Tech Fests</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "..." : stats.totalStudents.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">Students</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {loading ? "..." : stats.totalColleges.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">Colleges</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">Unbound</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to participate, organize, and excel in tech competitions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured <span className="gradient-text">Events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover exciting opportunities to showcase your skills
            </p>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="card-hover h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{event.category}</Badge>
                        <Badge variant={event.mode === "online" ? "default" : "outline"}>{event.mode}</Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{event.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {event.college.name}, {event.college.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.registrationCount}/{event.maxParticipants} registered
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-semibold text-foreground">
                            {event.fees === 0 ? "Free" : `₹${event.fees}`}
                          </span>
                          <Link href="/explore">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button size="lg" variant="outline" className="btn-animate bg-transparent">
                View All Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your <span className="gradient-text">Tech Journey</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of students and colleges already using Unbound to connect, compete, and grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=student">
                <Button size="lg" className="btn-animate shadow-glow">
                  Join as Student
                </Button>
              </Link>
              <Link href="/auth/register?role=college">
                <Button size="lg" variant="outline" className="btn-animate bg-transparent">
                  Register College
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Unbound</span>
              </div>
              <p className="text-muted-foreground">
                India's largest tech fest platform connecting students and colleges.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/explore" className="block hover:text-foreground transition-colors">
                  Explore Events
                </Link>
                <Link href="/auth/register" className="block hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">
                  Help Center
                </a>
                <a href="#" className="block hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#" className="block hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Unbound. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
