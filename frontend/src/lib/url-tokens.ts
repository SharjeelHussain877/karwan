/**
 * Supabase email links arrive as either
 *   #access_token=…&refresh_token=…&type=signup|recovery   (implicit flow), or
 *   ?token_hash=…&type=…                                    (custom email template)
 * and failures as #error=…&error_description=…
 * Read them once, then scrub them from the address bar.
 */
export type UrlTokens = {
  accessToken: string
  refreshToken: string
  tokenHash: string
  type: string
  error: string
}

export function readUrlTokens(): UrlTokens {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const query = new URLSearchParams(window.location.search)
  const get = (key: string): string => hash.get(key) ?? query.get(key) ?? ""

  const description = get("error_description").replace(/\+/g, " ")

  const tokens: UrlTokens = {
    accessToken: get("access_token"),
    refreshToken: get("refresh_token"),
    tokenHash: get("token_hash"),
    type: get("type"),
    error: description !== "" ? description : get("error"),
  }

  if (tokens.accessToken !== "" || tokens.tokenHash !== "" || tokens.error !== "") {
    window.history.replaceState(null, "", window.location.pathname)
  }

  return tokens
}
