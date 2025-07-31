import { apiLogger } from "./utils"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api"

interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
    apiLogger.info("API Client initialized", { baseURL })
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
    apiLogger.info("Token set successfully")
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    apiLogger.info("Token cleared")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        throw new Error("API calls not supported in server environment")
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 seconds timeout

      const url = `${this.baseURL}${endpoint}`
      apiLogger.debug(`Making API request to: ${url}`, { method: options.method || "GET" })

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      // Handle different response types
      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
        apiLogger.debug(`Response data:`, data)
      } else {
        // Handle non-JSON responses
        const text = await response.text()
        apiLogger.warn(`Non-JSON response from ${url}:`, text)
        data = {
          message: text || `HTTP ${response.status}: ${response.statusText}`,
          success: false,
        }
      }

      if (!response.ok) {
        apiLogger.error(`API Error ${response.status} from ${url}:`, data)
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      apiLogger.debug(`API request successful: ${url}`, { status: response.status })
      return data
    } catch (error: any) {
      apiLogger.error(`API Error for ${endpoint}:`, error)

      // Handle different types of errors
      if (error.name === "AbortError") {
        throw new Error("Request timeout")
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("fetch")) {
        throw new Error("Network unavailable")
      } else if (error.message?.includes("NetworkError")) {
        throw new Error("Network error")
      } else {
        throw error
      }
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    apiLogger.info("Attempting login", { email })
    const response = await this.request<{ token: string; role: string; email: string; sname?: string; cname?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    
    // Handle different response structures
    if (response.success === false) {
      throw new Error(response.message || "Login failed")
    }
    
    // If response has data property, use it
    if (response.data) {
      return { success: true, data: response.data }
    }
    
    // If response is the data directly (no wrapper)
    if ('token' in response && response.token) {
      return { success: true, data: response as { token: string; role: string; email: string; sname?: string; cname?: string } }
    }
    
    // Fallback
    return { success: true, data: response as { token: string; role: string; email: string; sname?: string; cname?: string } }
  }

  async register(userData: {
    email: string
    password: string
    role: "Student" | "College" | "Admin"
    sname?: string
    collegeId?: number
    cname?: string
    cdescription?: string
    address?: string
    contactEmail?: string
  }) {
    apiLogger.info("Attempting registration", { email: userData.email, role: userData.role })
    const response = await this.request<{ token: string; role: string; email: string; sname?: string; cname?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    
    // Handle different response structures
    if (response.success === false) {
      throw new Error(response.message || "Registration failed")
    }
    
    // If response has data property, use it
    if (response.data) {
      return { success: true, data: response.data }
    }
    
    // If response is the data directly (no wrapper)
    if ('token' in response && response.token) {
      return { success: true, data: response as { token: string; role: string; email: string; sname?: string; cname?: string } }
    }
    
    // Fallback
    return { success: true, data: response as { token: string; role: string; email: string; sname?: string; cname?: string } }
  }

  async forgotPassword(email: string) {
    apiLogger.info("Requesting password reset", { email })
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    apiLogger.info("Resetting password")
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    })
  }

  // Health check endpoints
  async healthCheck() {
    apiLogger.debug("Performing health check")
    return this.request("/health")
  }

  async ping() {
    apiLogger.debug("Performing ping")
    return this.request("/health/ping")
  }

  // Public exploration endpoints
  async exploreFests(params?: {
    name?: string
    city?: string
    mode?: string
    state?: string
    country?: string
  }) {
    apiLogger.debug("Exploring fests", params)
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request(`/explore/fests${queryString ? `?${queryString}` : ""}`)
  }

  async getPublicFests(params?: {
    page?: number
    limit?: number
    search?: string
  }) {
    apiLogger.debug("Getting public fests", params)
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request(`/explore/fests${queryString ? `?${queryString}` : ""}`)
  }

  async exploreEvents(params?: {
    category?: string
    minFee?: number
    maxFee?: number
    teamAllowed?: boolean
    city?: string
    state?: string
    country?: string
    mode?: string
  }) {
    apiLogger.debug("Exploring events", params)
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request(`/explore/events${queryString ? `?${queryString}` : ""}`)
  }

  async getPublicEvents(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    mode?: string
  }) {
    apiLogger.debug("Getting public events", params)
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return this.request(`/explore/events${queryString ? `?${queryString}` : ""}`)
  }

  async getExploreStats() {
    apiLogger.debug("Getting explore stats")
    return this.request("/explore/stats")
  }

  // Student endpoints
  async getStudentDashboardStats() {
    apiLogger.debug("Getting student dashboard stats")
    return this.request("/student/events/dashboard/stats")
  }

  async getStudentDashboard() {
    apiLogger.debug("Getting student dashboard")
    try {
      // Get dashboard stats and registrations
      const [statsResponse, registrationsResponse] = await Promise.all([
        this.request("/student/events/dashboard/stats"),
        this.request("/student/events/my")
      ])
      
      // Combine the data into a dashboard format
      return {
        success: true,
        data: {
          stats: statsResponse.data || {
            totalRegistrations: 0,
            approvedRegistrations: 0,
            pendingRegistrations: 0,
            totalCertificates: 0
          },
          recentRegistrations: registrationsResponse.data || []
        }
      }
    } catch (error) {
      apiLogger.error("Failed to get student dashboard", error)
      throw error
    }
  }

  async getMyRegistrations() {
    apiLogger.debug("Getting my registrations")
    return this.request("/student/events/my")
  }

  async registerForEvent(registrationData: {
    eventId: number
    registrationType: "solo" | "team"
    teamName?: string
    teamId?: number
  }) {
    apiLogger.info("Registering for event", registrationData)
    return this.request("/student/events/register", {
      method: "POST",
      body: JSON.stringify(registrationData),
    })
  }

  async downloadCertificate(registrationId: string) {
    apiLogger.info("Downloading certificate", { registrationId })
    return this.request(`/student/certificates/${registrationId}`)
  }

  // Team management
  async getTeamsForEvent(eventId: number) {
    apiLogger.debug("Getting teams for event", { eventId })
    return this.request(`/student/teams/event/${eventId}`)
  }

  async getMyTeams() {
    apiLogger.debug("Getting my teams")
    return this.request("/student/teams/my")
  }

  async getTeamMembers(teamId: number) {
    apiLogger.debug("Getting team members", { teamId })
    return this.request(`/student/teams/${teamId}/members`)
  }

  async leaveTeam(teamId: number) {
    apiLogger.info("Leaving team", { teamId })
    return this.request(`/student/teams/${teamId}/leave`, {
      method: "DELETE",
    })
  }

  // Event reviews
  async submitReview(eventId: number, reviewData: { rating: number; reviewText: string }) {
    apiLogger.info("Submitting review", { eventId, rating: reviewData.rating })
    return this.request(`/events/${eventId}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  async getMyReview(eventId: number) {
    apiLogger.debug("Getting my review", { eventId })
    return this.request(`/events/${eventId}/review`)
  }

  async getEventReviews(eventId: number) {
    apiLogger.debug("Getting event reviews", { eventId })
    return this.request(`/events/${eventId}/reviews`)
  }

  // College endpoints
  async getCollegeDashboardStats() {
    apiLogger.debug("Getting college dashboard stats")
    return this.request("/college/dashboard/stats")
  }

  async getCollegeStats() {
    apiLogger.debug("Getting college stats")
    return this.request("/college/dashboard/stats")
  }

  async getCollegeEvents() {
    apiLogger.debug("Getting college events")
    return this.request("/college/dashboard/events")
  }

  async getCollegeEarnings() {
    apiLogger.debug("Getting college earnings")
    return this.request("/college/dashboard/earnings")
  }

  async getCollegeRegistrations() {
    apiLogger.debug("Getting college registrations")
    return this.request("/college/dashboard/registrations")
  }

  async getCollegeAnalyticsByFest() {
    apiLogger.debug("Getting college analytics by fest")
    return this.request("/college/dashboard/analytics/by-fest")
  }

  async getCollegeAnalyticsByDate() {
    apiLogger.debug("Getting college analytics by date")
    return this.request("/college/dashboard/analytics/by-date")
  }

  async getCollegeTopEvents() {
    apiLogger.debug("Getting college top events")
    return this.request("/college/dashboard/analytics/top-events")
  }

  async getEventRegistrations(eventId: number) {
    apiLogger.debug("Getting event registrations", { eventId })
    return this.request(`/college/dashboard/events/${eventId}/registrations`)
  }

  async approveCertificate(eventId: number, registrationId: number) {
    apiLogger.info("Approving certificate", { eventId, registrationId })
    return this.request(`/college/dashboard/events/${eventId}/registrations/${registrationId}/approve-certificate`, {
      method: "POST",
    })
  }

  async approveAllCertificates(eventId: number) {
    apiLogger.info("Approving all certificates", { eventId })
    return this.request(`/college/dashboard/events/${eventId}/registrations/approve-all-certificates`, {
      method: "POST",
    })
  }

  async approveCertificatesList(eventId: number, registrationIds: number[]) {
    apiLogger.info("Approving certificates list", { eventId, count: registrationIds.length })
    return this.request(`/college/dashboard/events/${eventId}/registrations/approve-certificates`, {
      method: "POST",
      body: JSON.stringify({ registrationIds }),
    })
  }

  // College payment configuration
  async configureCollegePayment(paymentConfig: {
    razorpayAccountId: string
    bankAccountNumber: string
    bankIfscCode: string
    bankAccountHolderName: string
    contactEmail: string
  }) {
    apiLogger.info("Configuring college payment", { contactEmail: paymentConfig.contactEmail })
    return this.request("/college/payment-config", {
      method: "POST",
      body: JSON.stringify(paymentConfig),
    })
  }

  async getCollegePaymentConfig() {
    apiLogger.debug("Getting college payment config")
    return this.request("/college/payment-config")
  }

  // Fest management
  async createFest(festData: {
    fname: string
    fdescription: string
    startDate: string
    endDate: string
    city: string
    state: string
    country: string
    mode: string
    website?: string
    contactPhone?: string
  }) {
    apiLogger.info("Creating fest", { fname: festData.fname })
    return this.request("/fests", {
      method: "POST",
      body: JSON.stringify(festData),
    })
  }

  async getFests() {
    apiLogger.debug("Getting fests")
    return this.request("/fests")
  }

  async updateFest(festId: number, festData: any) {
    apiLogger.info("Updating fest", { festId })
    return this.request(`/fests/${festId}`, {
      method: "PUT",
      body: JSON.stringify(festData),
    })
  }

  async deleteFest(festId: number) {
    apiLogger.info("Deleting fest", { festId })
    return this.request(`/fests/${festId}`, {
      method: "DELETE",
    })
  }

  async uploadFestImage(festId: number, imageFile: File) {
    apiLogger.info("Uploading fest image", { festId, fileName: imageFile.name })
    const formData = new FormData()
    formData.append("image", imageFile)

    return this.request(`/fests/${festId}/image`, {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  async getFestEvents(festId: number) {
    apiLogger.debug("Getting fest events", { festId })
    return this.request(`/fests/${festId}/events`)
  }

  // Event management
  async createEvent(eventData: {
    ename: string
    edescription: string
    eventDate: string
    fees: number
    location: string
    capacity: number
    teamIsAllowed: boolean
    category: string
    mode: string
    fid?: number
    cashPrize?: string
    firstPrize?: string
    secondPrize?: string
    thirdPrize?: string
    city: string
    state: string
    country: string
    eventWebsite?: string
    contactPhone?: string
    organizerName?: string
    organizerEmail?: string
    organizerPhone?: string
    rules?: string
    requirements?: string
    registrationDeadline: string
  }) {
    apiLogger.info("Creating event", { ename: eventData.ename })
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  }

  async getEvents() {
    apiLogger.debug("Getting events")
    return this.request("/events")
  }

  async updateEvent(eventId: number, eventData: any) {
    apiLogger.info("Updating event", { eventId })
    return this.request(`/events/${eventId}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(eventId: number) {
    apiLogger.info("Deleting event", { eventId })
    return this.request(`/events/${eventId}`, {
      method: "DELETE",
    })
  }

  async uploadEventPoster(eventId: number, posterFile: File) {
    apiLogger.info("Uploading event poster", { eventId, fileName: posterFile.name })
    const formData = new FormData()
    formData.append("file", posterFile)

    return this.request(`/events/${eventId}/poster`, {
      method: "POST",
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    })
  }

  async deleteEventPoster(eventId: number) {
    apiLogger.info("Deleting event poster", { eventId })
    return this.request(`/events/${eventId}/poster`, {
      method: "DELETE",
    })
  }

  async getEventPosterAuditLogs(eventId: number) {
    apiLogger.debug("Getting event poster audit logs", { eventId })
    return this.request(`/events/${eventId}/poster/audit-logs`)
  }

  async getEventStats(eventId: number) {
    apiLogger.debug("Getting event stats", { eventId })
    return this.request(`/events/${eventId}/stats`)
  }

  async getEventRating(eventId: number) {
    apiLogger.debug("Getting event rating", { eventId })
    return this.request(`/events/${eventId}/rating`)
  }

  // Payment endpoints
  async getAllRegistrations() {
    apiLogger.debug("Getting all registrations")
    return this.request("/payments/registrations")
  }

  async createPaymentOrder(paymentData: {
    registrationId: number
    amount: number
    currency: string
    receiptEmail: string
  }) {
    apiLogger.info("Creating payment order", { registrationId: paymentData.registrationId, amount: paymentData.amount })
    return this.request("/payments/create-order", {
      method: "POST",
      body: JSON.stringify(paymentData),
    })
  }

  async verifyPayment(verificationData: {
    razorpayOrderId: string
    status: string
    paymentId: string
  }) {
    apiLogger.info("Verifying payment", { razorpayOrderId: verificationData.razorpayOrderId })
    return this.request("/payments/verify", {
      method: "POST",
      body: JSON.stringify(verificationData),
    })
  }

  // Admin endpoints
  async getAdminDashboardStats() {
    apiLogger.debug("Getting admin dashboard stats")
    return this.request("/admin/dashboard/stats")
  }

  async getAdminStats() {
    apiLogger.debug("Getting admin stats")
    return this.request("/admin/dashboard/stats")
  }

  async getPendingFests() {
    apiLogger.debug("Getting pending fests")
    return this.request("/admin/fests/pending")
  }

  async getPendingEvents() {
    apiLogger.debug("Getting pending events")
    return this.request("/admin/events/pending")
  }

  async approveFest(festId: number) {
    apiLogger.info("Approving fest", { festId })
    return this.request(`/admin/fests/${festId}/approve`, {
      method: "POST",
    })
  }

  async rejectFest(festId: number, reason: string) {
    apiLogger.info("Rejecting fest", { festId, reason })
    return this.request(`/admin/fests/${festId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  async approveEvent(eventId: number) {
    apiLogger.info("Approving event", { eventId })
    return this.request(`/admin/events/${eventId}/approve`, {
      method: "POST",
    })
  }

  async rejectEvent(eventId: number, reason: string) {
    apiLogger.info("Rejecting event", { eventId, reason })
    return this.request(`/admin/events/${eventId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  async getAllColleges() {
    apiLogger.debug("Getting all colleges")
    return this.request("/admin/colleges")
  }

  // Test endpoints
  async testProtectedEndpoint() {
    apiLogger.debug("Testing protected endpoint")
    return this.request("/protected")
  }

  async getAllUsers() {
    apiLogger.debug("Getting all users")
    return this.request("/users")
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export const api = apiClient
export type { ApiResponse }

// Type definitions
export interface Event {
  id?: number
  ename: string
  edescription: string
  eventDate: string
  fees: number
  location: string
  capacity: number
  teamIsAllowed: boolean
  category: string
  mode: string
  status?: string
  fid?: number
  cashPrize?: string
  firstPrize?: string
  secondPrize?: string
  thirdPrize?: string
  city: string
  state: string
  country: string
  eventWebsite?: string
  contactPhone?: string
  organizerName?: string
  organizerEmail?: string
  organizerPhone?: string
  rules?: string
  requirements?: string
  registrationDeadline: string
}

export interface Fest {
  id?: number
  fname: string
  fdescription: string
  startDate: string
  endDate: string
  city: string
  state: string
  country: string
  mode: string
  website?: string
  contactPhone?: string
  status?: string
}

export interface DashboardStats {
  totalEvents?: number
  totalFests?: number
  totalRegistrations?: number
  totalRevenue?: number
  totalEarnings?: number
  pendingEvents?: number
  approvedEvents?: number
  pendingFests?: number
  approvedFests?: number
  pendingApprovals?: number
}
