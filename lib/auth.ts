import { apiClient } from "./api"
import { authLogger } from "./utils"

export interface User {
  id?: string
  email: string
  role: "Student" | "College" | "Admin"
  sname?: string
  cname?: string
  collegeId?: number
  cdescription?: string
  address?: string
  contactEmail?: string
  isApproved?: boolean
  createdAt?: string
}

class AuthService {
  private user: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        this.user = JSON.parse(savedUser)
        authLogger.info("User loaded from localStorage", { 
          email: this.user?.email, 
          role: this.user?.role 
        })
      }
    }
    authLogger.info("AuthService initialized")
  }

  async login(email: string, password: string): Promise<User> {
    try {
      authLogger.info("Attempting login", { email })
      const response = await apiClient.login(email, password)

      authLogger.debug("Login response received", response)

      if (response.success && response.data) {
        const userData = response.data
        const { token, role, email: userEmail, sname, cname } = userData

        // Set token in API client
        apiClient.setToken(token)

        // Create user object
        const user: User = {
          email: userEmail,
          role: role as "Student" | "College" | "Admin",
          sname,
          cname,
        }

        // Save user data
        this.user = user
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user))
          localStorage.setItem("token", token)
        }

        authLogger.info("Login successful", { email: userEmail, role })
        return user
      } else {
        authLogger.error("Login failed - invalid response structure", { response })
        throw new Error("Login failed - invalid response")
      }
    } catch (error) {
      authLogger.error("Login error", error)
      throw error
    }
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
  }): Promise<User> {
    try {
      authLogger.info("Attempting registration", { email: userData.email, role: userData.role })
      const response = await apiClient.register(userData)

      authLogger.debug("Registration response received", response)

      if (response.success && response.data) {
        const userResponseData = response.data
        const { token, role, email: userEmail, sname, cname } = userResponseData

        // Set token in API client
        apiClient.setToken(token)

        // Create user object
        const user: User = {
          email: userEmail,
          role: role as "Student" | "College" | "Admin",
          sname,
          cname,
          collegeId: userData.collegeId,
          cdescription: userData.cdescription,
          address: userData.address,
          contactEmail: userData.contactEmail,
        }

        // Save user data
        this.user = user
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(user))
          localStorage.setItem("token", token)
        }

        authLogger.info("Registration successful", { email: userEmail, role })
        return user
      } else {
        authLogger.error("Registration failed - invalid response structure", { response })
        throw new Error("Registration failed - invalid response")
      }
    } catch (error) {
      authLogger.error("Registration error", error)
      throw error
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      authLogger.info("Requesting password reset", { email })
      console.log("🔍 Calling apiClient.forgotPassword...")
      const response = await apiClient.forgotPassword(email)
      console.log("🔍 Backend response:", response)
      console.log("🔍 Response success:", response.success)
      console.log("🔍 Response message:", response.message)
      
      // Accept either success: true or the specific message
      if (
        response.success === false &&
        response.message !== "Reset password link sent to email"
      ) {
        console.log("❌ Treating as error - success is false and message doesn't match")
        authLogger.error("Forgot password failed", { message: response.message })
        throw new Error(response.message || "Failed to send reset email")
      }
      console.log("✅ Treating as success!")
      authLogger.success("Password reset email sent successfully", { email })
    } catch (error: any) {
      console.error("❌ Auth service error:", error)
      authLogger.error("Forgot password error", error)
      // Handle specific backend errors
      if (error.message?.includes("Account Not Found")) {
        throw new Error("No account found with that email address. Please check your email or register a new account.")
      } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        throw new Error("Password reset feature is not available yet. Please contact support or try logging in with your current password.")
      } else {
        throw new Error(error.message || "Failed to send reset email. Please try again later.")
      }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      authLogger.info("Resetting password")
      console.log("🔍 Calling apiClient.resetPassword...")
      const response = await apiClient.resetPassword(token, newPassword)
      console.log("🔍 Backend response:", response)
      console.log("🔍 Response success:", response.success)
      console.log("🔍 Response message:", response.message)
      
      // Accept either success: true or success-indicating messages
      if (
        response.success === false &&
        !response.message?.toLowerCase().includes("success") &&
        !response.message?.toLowerCase().includes("reset") &&
        !response.message?.toLowerCase().includes("updated")
      ) {
        console.log("❌ Treating as error - success is false and message doesn't indicate success")
        authLogger.error("Reset password failed", { message: response.message })
        throw new Error(response.message || "Failed to reset password")
      }
      console.log("✅ Treating as success!")
      authLogger.success("Password reset successful")
    } catch (error: any) {
      console.error("❌ Auth service error:", error)
      authLogger.error("Reset password error", error)
      // Handle specific backend errors
      if (error.message?.includes("Invalid") || error.message?.includes("expired")) {
        throw new Error("Invalid or expired reset link. Please request a new password reset.")
      } else if (error.message?.includes("404") || error.message?.includes("Not Found")) {
        throw new Error("Password reset feature is not available yet. Please contact support.")
      } else {
        throw new Error(error.message || "Failed to reset password. Please try again.")
      }
    }
  }

  logout(): void {
    authLogger.info("Logging out user", { email: this.user?.email })
    this.user = null
    apiClient.clearToken()

    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }

  getCurrentUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return this.user !== null
  }

  hasRole(role: string): boolean {
    return this.user?.role === role
  }

  isApproved(): boolean {
    return this.user?.isApproved === true
  }

  getRedirectPath(role: string): string {
    switch (role) {
      case "Student":
        return "/student/dashboard"
      case "College":
        return "/college/dashboard"
      case "Admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  async healthCheck(): Promise<any> {
    try {
      authLogger.debug("Performing health check")
      return await apiClient.healthCheck()
    } catch (error) {
      authLogger.error("Health check error", error)
      throw error
    }
  }

  async ping(): Promise<any> {
    try {
      authLogger.debug("Performing ping")
      return await apiClient.ping()
    } catch (error) {
      authLogger.error("Ping error", error)
      throw error
    }
  }
}

export const authService = new AuthService()

export const getAuthState = (): { user: User | null; token: string | null; isAuthenticated: boolean } => {
  const user = authService.getCurrentUser()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  return {
    user,
    token,
    isAuthenticated: authService.isAuthenticated(),
  }
}

export const clearAuthState = (): void => {
  authService.logout()
}
