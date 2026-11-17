import { isSessionActive } from "@/lib/session"
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from "axios"

export const API_URL: string = import.meta.env.VITE_API_URL

let onSessionExpired: () => void = () => {}

/** The store registers this so a failed refresh can sign the user out in the UI. */
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // the backend keeps the session in httpOnly cookies
  headers: { "Content-Type": "application/json" },
})

const NO_REFRESH: string[] = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
]

let refreshing: Promise<AxiosResponse> | null = null
const replayed = new WeakSet<InternalAxiosRequestConfig>()

// On 401, try one silent refresh then replay the request.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response === undefined || error.config === undefined) {
      return Promise.reject(error)
    }

    const original = error.config
    const path = original.url ?? ""

    if (
      error.response.status !== 401 ||
      !isSessionActive() ||
      replayed.has(original) ||
      NO_REFRESH.some((noRefresh) => path.startsWith(noRefresh))
    ) {
      return Promise.reject(error)
    }

    replayed.add(original)
    refreshing ??= api.post("/auth/refresh").finally(() => {
      refreshing = null
    })

    try {
      await refreshing
      return api(original)
    } catch {
      onSessionExpired()
      return Promise.reject(error)
    }
  }
)
