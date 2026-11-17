import type { Request, Response, CookieOptions } from "express";
import type { Session } from "@supabase/supabase-js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

const base = (): CookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/"
});

export const setSessionCookies = (res: Response, session: Session) => {
  res.cookie(ACCESS_COOKIE, session.access_token, {
    ...base(),
    maxAge: (session.expires_in ?? 3600) * 1000
  });
  res.cookie(REFRESH_COOKIE, session.refresh_token, {
    ...base(),
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
};

export const clearSessionCookies = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE, base());
  res.clearCookie(REFRESH_COOKIE, base());
};

export const getAccessToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[ACCESS_COOKIE];
};

export const getRefreshToken = (req: Request): string | undefined =>
  req.cookies?.[REFRESH_COOKIE];
