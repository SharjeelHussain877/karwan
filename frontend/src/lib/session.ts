/**
 * The session itself lives in httpOnly cookies, which JavaScript cannot read.
 * This flag records "a login succeeded in this browser", so /auth/me and
 * /auth/refresh are only called for users who actually logged in.
 */
const KEY = "adsync:session"

export function isSessionActive(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}

export function setSessionActive(active: boolean): void {
  try {
    if (active) window.localStorage.setItem(KEY, "1")
    else window.localStorage.removeItem(KEY)
  } catch {
    // Storage unavailable (e.g. private mode): the session just won't survive a reload.
  }
}
