// Simple test script to check login functionality
const API_BASE_URL = "http://localhost:8081/api"

async function testHealthCheck() {
  try {
    console.log("Testing health check...")
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()
    console.log("Health check response:", data)
    return data
  } catch (error) {
    console.error("Health check failed:", error)
    return null
  }
}

async function testLogin(email, password) {
  try {
    console.log(`Testing login with: ${email}`)
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    console.log("Login response:", data)
    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    
    return { success: response.ok, data, status: response.status }
  } catch (error) {
    console.error("Login test failed:", error)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log("=== Login Test Suite ===")
  
  // Test 1: Health Check
  console.log("\n1. Testing backend connectivity...")
  const health = await testHealthCheck()
  
  if (!health) {
    console.log("❌ Backend is not accessible. Make sure it's running on http://localhost:8081")
    return
  }
  
  console.log("✅ Backend is accessible")
  
  // Test 2: Login with test credentials
  console.log("\n2. Testing login with test credentials...")
  const testCredentials = [
    { email: "college1@example.com", password: "password123" },
    { email: "student@demo.com", password: "demo123" },
    { email: "admin@demo.com", password: "demo123" }
  ]
  
  for (const cred of testCredentials) {
    console.log(`\n--- Testing: ${cred.email} ---`)
    const result = await testLogin(cred.email, cred.password)
    
    if (result.success) {
      console.log("✅ Login successful")
      console.log("Token:", result.data.token ? "Present" : "Missing")
      console.log("Role:", result.data.role)
    } else {
      console.log("❌ Login failed")
      console.log("Error:", result.data?.message || result.error)
    }
  }
  
  console.log("\n=== Test Complete ===")
}

// Run the tests
runTests() 