"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { authService } from "@/lib/auth"

export default function DebugLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Attempting login with:", { email: formData.email })
      
      // Test direct API call first
      const apiResponse = await apiClient.login(formData.email, formData.password)
      console.log("API Response:", apiResponse)
      
      // Test auth service
      const user = await authService.login(formData.email, formData.password)
      console.log("Auth Service Response:", user)
      
      setResult({
        apiResponse,
        user,
        timestamp: new Date().toISOString()
      })
      
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed")
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

  const testHealthCheck = async () => {
    try {
      const health = await apiClient.healthCheck()
      console.log("Health check:", health)
      setResult({ health, timestamp: new Date().toISOString() })
    } catch (err: any) {
      setError(`Health check failed: ${err.message}`)
    }
  }

  const testPing = async () => {
    try {
      const ping = await apiClient.ping()
      console.log("Ping:", ping)
      setResult({ ping, timestamp: new Date().toISOString() })
    } catch (err: any) {
      setError(`Ping failed: ${err.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Login Debug</h1>
        <p className="text-muted-foreground">Debug login issues and test API connectivity</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Backend Connectivity</CardTitle>
            <CardDescription>Test if the backend is accessible</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testHealthCheck} className="w-full">
              Test Health Check
            </Button>
            <Button onClick={testPing} className="w-full">
              Test Ping
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Test</CardTitle>
            <CardDescription>Test login with credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Testing..." : "Test Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
            <CardDescription>Response from API calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api"}
            </div>
            <div>
              <strong>Backend URL:</strong> http://localhost:8081
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Credentials</CardTitle>
          <CardDescription>Use these to test login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Student:</strong> student@demo.com / demo123
            </div>
            <div>
              <strong>College:</strong> college@demo.com / demo123
            </div>
            <div>
              <strong>Admin:</strong> admin@demo.com / demo123
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 