"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, Zap, ArrowLeft, User, Building, Shield, Rocket, Star, Globe } from "lucide-react"
import { authService } from "@/lib/auth"
import { uiLogger } from "@/lib/utils"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get("role") as "Student" | "College" | "Admin") || "Student"

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
    sname: "",
    collegeId: "",
    cname: "",
    cdescription: "",
    address: "",
    contactEmail: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    // Validate required fields based on role
    if (formData.role === "Student") {
      if (!formData.sname.trim()) {
        setError("Student name is required")
        setLoading(false)
        return
      }
      if (!formData.collegeId.trim()) {
        setError("College ID is required")
        setLoading(false)
        return
      }
    } else if (formData.role === "College") {
      if (!formData.cname.trim()) {
        setError("College name is required")
        setLoading(false)
        return
      }
    }

    try {
      uiLogger.info("Attempting registration", { email: formData.email, role: formData.role })
      
      const userData: any = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      // Add role-specific fields
      if (formData.role === "Student") {
        userData.sname = formData.sname.trim()
        userData.collegeId = Number.parseInt(formData.collegeId)
      } else if (formData.role === "College") {
        userData.cname = formData.cname.trim()
        if (formData.cdescription.trim()) userData.cdescription = formData.cdescription.trim()
        if (formData.address.trim()) userData.address = formData.address.trim()
        if (formData.contactEmail.trim()) userData.contactEmail = formData.contactEmail.trim()
      }

      uiLogger.debug("Registration data prepared", { userData: { ...userData, password: "[HIDDEN]" } })

      const user = await authService.register(userData)

      uiLogger.info("Registration successful", { email: user.email, role: user.role })

      // Redirect based on role
      const redirectPath = authService.getRedirectPath(user.role)
      router.push(redirectPath)
    } catch (error: any) {
      console.error("Registration error:", error)
      uiLogger.error("Registration failed", error)
      setError(error.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      role: role as "Student" | "College" | "Admin",
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Student":
        return <User className="w-4 h-4" />
      case "College":
        return <Building className="w-4 h-4" />
      case "Admin":
        return <Shield className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const benefits = [
    {
      icon: Rocket,
      title: "Launch Your Career",
      description: "Get noticed by top companies and recruiters",
    },
    {
      icon: Star,
      title: "Skill Recognition",
      description: "Earn certificates and showcase your achievements",
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with students and professionals worldwide",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-6 relative z-10 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-secondary-foreground" />
              </div>
              <span className="text-3xl font-bold gradient-text">Unbound</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-muted-foreground">Join the largest tech fest platform</p>
          </motion.div>

          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold">Sign Up</CardTitle>
                <CardDescription>Create your account to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Account Type
                    </Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger className="h-11 bg-background/50 border-border/50">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Student</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="College">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>College</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Admin">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <span>Admin</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={loading}
                        className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    {/* Role-specific fields */}
                    {formData.role === "Student" && (
                      <div className="space-y-2">
                        <Label htmlFor="sname" className="text-sm font-medium">
                          Student Name
                        </Label>
                        <Input
                          id="sname"
                          name="sname"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.sname}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {formData.role === "Student" && (
                      <div className="space-y-2">
                        <Label htmlFor="collegeId" className="text-sm font-medium">
                          College ID
                        </Label>
                        <Input
                          id="collegeId"
                          name="collegeId"
                          type="number"
                          placeholder="Enter your college ID"
                          value={formData.collegeId}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {formData.role === "College" && (
                      <div className="space-y-2">
                        <Label htmlFor="cname" className="text-sm font-medium">
                          College Name
                        </Label>
                        <Input
                          id="cname"
                          name="cname"
                          type="text"
                          placeholder="Enter college name"
                          value={formData.cname}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {formData.role === "College" && (
                      <div className="space-y-2">
                        <Label htmlFor="cdescription" className="text-sm font-medium">
                          College Description
                        </Label>
                        <Input
                          id="cdescription"
                          name="cdescription"
                          type="text"
                          placeholder="Brief description of your college"
                          value={formData.cdescription}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {formData.role === "College" && (
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm font-medium">
                          Address
                        </Label>
                        <Input
                          id="address"
                          name="address"
                          type="text"
                          placeholder="College address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}

                    {formData.role === "College" && (
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-sm font-medium">
                          Contact Email
                        </Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="Contact email for the college"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Password fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Visual Content */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-16 right-24 w-24 h-24 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-3xl backdrop-blur-sm"
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, 8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1.5,
          }}
          className="absolute bottom-24 right-16 w-18 h-18 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl backdrop-blur-sm"
        />

        <motion.div
          animate={{
            y: [0, -8, 0],
            x: [0, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute top-1/3 right-8 w-14 h-14 bg-gradient-to-br from-secondary/30 to-primary/30 rounded-xl backdrop-blur-sm"
        />

        <div className="flex flex-col justify-center items-center p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 gradient-text">Start Your Journey</h2>
            <p className="text-xl text-muted-foreground max-w-md">
              Join a community of innovators, creators, and tech enthusiasts from across the globe
            </p>
          </motion.div>

          <div className="space-y-8 max-w-sm">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <benefit.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 backdrop-blur-sm border border-primary/20">
              <div className="text-3xl font-bold gradient-text mb-2">280+</div>
              <div className="text-sm text-muted-foreground">Colleges already registered</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
