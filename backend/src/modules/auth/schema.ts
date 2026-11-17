import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address");

export const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

/**
 * Sign up takes exactly name, email and password. `.strict()` makes any other field
 * (role, app_metadata, is_super_admin, ...) a 400, so a role can never ride along from
 * a client. The role of a new account is always set by the server (see service.signUp).
 */
export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email,
    password
  })
  .strict();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required")
});

export const emailSchema = z.object({ email });

// Absent tokens are sent as empty strings so every field is always a string.
export const resetPasswordSchema = z
  .object({
    accessToken: z.string(),
    tokenHash: z.string(),
    password
  })
  .refine((v) => v.accessToken !== "" || v.tokenHash !== "", {
    message: "Reset link is invalid or has expired"
  });

export const verifyEmailSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    tokenHash: z.string()
  })
  .refine((v) => v.tokenHash !== "" || (v.accessToken !== "" && v.refreshToken !== ""), {
    message: "Verification link is invalid or has expired"
  });
