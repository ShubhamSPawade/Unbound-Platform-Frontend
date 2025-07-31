"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    // Redirect to the new reset password page with the token
    const newUrl = `/auth/reset-password${token ? `?token=${token}` : ""}`
    router.replace(newUrl)
  }, [router, token])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to reset password page...</p>
      </div>
    </div>
  )
} 