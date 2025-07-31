import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Logger utility
export class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  info(message: string, data?: any) {
    if (data && Object.keys(data).length > 0) {
      console.log(`[${this.context}] INFO:`, message, data)
    } else {
      console.log(`[${this.context}] INFO:`, message)
    }
  }

  warn(message: string, data?: any) {
    if (data && Object.keys(data).length > 0) {
      console.warn(`[${this.context}] WARN:`, message, data)
    } else {
      console.warn(`[${this.context}] WARN:`, message)
    }
  }

  error(message: string, error?: any) {
    // Only log actual errors, not success messages
    if (error && Object.keys(error).length > 0) {
      console.error(`[${this.context}] ERROR:`, message, error)
    } else {
      console.error(`[${this.context}] ERROR:`, message)
    }
  }

  success(message: string, data?: any) {
    if (data && Object.keys(data).length > 0) {
      console.log(`[${this.context}] SUCCESS:`, message, data)
    } else {
      console.log(`[${this.context}] SUCCESS:`, message)
    }
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === "development") {
      if (data && Object.keys(data).length > 0) {
        console.debug(`[${this.context}] DEBUG:`, message, data)
      } else {
        console.debug(`[${this.context}] DEBUG:`, message)
      }
    }
  }
}

// Create logger instances for different modules
export const apiLogger = new Logger("API")
export const authLogger = new Logger("Auth")
export const uiLogger = new Logger("UI")
export const formLogger = new Logger("Form")
export const paymentLogger = new Logger("Payment")
export const eventLogger = new Logger("Event")
export const festLogger = new Logger("Fest")
export const dashboardLogger = new Logger("Dashboard")
