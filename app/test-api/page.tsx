"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api"
import { authService } from "@/lib/auth"

export default function TestApiPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [pingStatus, setPingStatus] = useState<any>(null)
  const [users, setUsers] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const testHealthCheck = async () => {
    setLoading("health")
    setError(null)
    try {
      const result = await apiClient.healthCheck()
      setHealthStatus(result)
    } catch (err: any) {
      setError(`Health check failed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const testPing = async () => {
    setLoading("ping")
    setError(null)
    try {
      const result = await apiClient.ping()
      setPingStatus(result)
    } catch (err: any) {
      setError(`Ping failed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const testGetUsers = async () => {
    setLoading("users")
    setError(null)
    try {
      const result = await apiClient.getAllUsers()
      setUsers(result)
    } catch (err: any) {
      setError(`Get users failed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  const testAuthService = async () => {
    setLoading("auth")
    setError(null)
    try {
      const result = await authService.healthCheck()
      console.log("Auth service health check:", result)
    } catch (err: any) {
      setError(`Auth service test failed: ${err.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">API Integration Test</h1>
        <p className="text-muted-foreground">Test the backend API integration</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
            <CardDescription>Test the main health endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testHealthCheck} 
              disabled={loading === "health"}
              className="w-full"
            >
              {loading === "health" ? "Testing..." : "Test Health Check"}
            </Button>
            {healthStatus && (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(healthStatus, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ping Test</CardTitle>
            <CardDescription>Test the ping endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testPing} 
              disabled={loading === "ping"}
              className="w-full"
            >
              {loading === "ping" ? "Testing..." : "Test Ping"}
            </Button>
            {pingStatus && (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(pingStatus, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get All Users</CardTitle>
            <CardDescription>Test getting all users (debug endpoint)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testGetUsers} 
              disabled={loading === "users"}
              className="w-full"
            >
              {loading === "users" ? "Testing..." : "Get All Users"}
            </Button>
            {users && (
              <div className="p-4 bg-muted rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(users, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auth Service Test</CardTitle>
            <CardDescription>Test the auth service health check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testAuthService} 
              disabled={loading === "auth"}
              className="w-full"
            >
              {loading === "auth" ? "Testing..." : "Test Auth Service"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Check browser console for auth service test results
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>Current API settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api"}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </div>
            <div>
              <strong>Backend URL:</strong> http://localhost:8081
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 