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
    return
  }
}
