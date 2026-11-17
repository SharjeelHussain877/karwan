import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  authLimiter,
  sensitiveLimiter
} from "../../middlewares/rate-limit.middleware.js";
import * as controller from "./controller.js";
import {
  emailSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyEmailSchema
} from "./schema.js";

const router = Router();

router.post("/signup", authLimiter, validate(signUpSchema), controller.signUp);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.get("/me", controller.me);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);

router.post("/verify-email", validate(verifyEmailSchema), controller.verifyEmail);
router.post(
  "/resend-verification",
  sensitiveLimiter,
  validate(emailSchema),
  controller.resendVerification
);

router.post(
  "/forgot-password",
  sensitiveLimiter,
  validate(emailSchema),
  controller.forgotPassword
);
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword);

export default router;
