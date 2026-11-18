import type { Request, Response } from "express";

import {
  clearSessionCookies,
  getAccessToken,
  getRefreshToken,
  setSessionCookies
} from "./cookies.js";
import * as service from "./service.js";

export const signUp = async (req: Request, res: Response) => {
  const { user, session } = await service.signUp(req.body);

  if (session) setSessionCookies(res, session);

  res.status(201).json({
    success: true,
    message: "Account created. Check your email to verify your address.",
    data: { user, verificationRequired: !session }
  });
};

export const login = async (req: Request, res: Response) => {
  const { user, session } = await service.login(req.body.email, req.body.password);
  setSessionCookies(res, session);
  res.json({ success: true, data: { user } });
};

export const me = async (req: Request, res: Response) => {
  const user = await service.getUserFromToken(getAccessToken(req));
  res.json({ success: true, data: { user } });
};

export const refresh = async (req: Request, res: Response) => {
  const { user, session } = await service.refresh(getRefreshToken(req));
  setSessionCookies(res, session);
  res.json({ success: true, data: { user } });
};

export const logout = async (req: Request, res: Response) => {
  await service.logout(getAccessToken(req));
  clearSessionCookies(res);
  res.json({ success: true, message: "Signed out" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  await service.forgotPassword(req.body.email);
  res.json({
    success: true,
    message: "If an account exists for this email, a reset link has been sent."
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  await service.resetPassword(req.body);
  res.json({ success: true, message: "Password updated. You can now sign in." });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { user, session } = await service.verifyEmail(req.body);
  setSessionCookies(res, session);
  res.json({ success: true, message: "Email verified", data: { user } });
};

export const resendVerification = async (req: Request, res: Response) => {
  await service.resendVerification(req.body.email);
  res.json({
    success: true,
    message: "If this email needs verification, a new link has been sent."
  });
};
