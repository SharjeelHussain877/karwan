import type { FieldValues, Path } from "react-hook-form"
import { z } from "zod"

/**
 * One place that describes every auth form: its zod schema, fields and copy.
 * <AuthForm /> renders any of them with react-hook-form.
 */

const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address")

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-zA-Z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number")

export type FieldConfig<TInput extends FieldValues> = {
  name: Path<TInput>
  label: string
  type: "text" | "email" | "password" | "tel" | "date"
  placeholder: string
  autoComplete: string
  /** Helper text under the input; "" for none. */
  description: string
}

export type FormConfig<TInput extends FieldValues, TOutput> = {
  schema: z.ZodType<TOutput, TInput>
  fields: FieldConfig<TInput>[]
  submitLabel: string
  defaultValues: TInput
}

/** Keeps field names and default values in sync with each schema. */
const defineForm = <TInput extends FieldValues, TOutput>(
  config: FormConfig<TInput, TOutput>
) => config

const signUp = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

const login = z.object({
  email,
  password: z.string().min(1, "Password is required"),
})

const emailOnly = z.object({ email })

// Everything is a string; "" means "not set".
const profile = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  date_of_birth: z
    .string()
    .refine(
      (value) => value === "" || (value >= "1900-01-01" && new Date(value) <= new Date()),
      "Date of birth must be a past date"
    ),
})

const resetPassword = z
  .object({
    password,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

const emailField = {
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "you@example.com",
  autoComplete: "email",
  description: "",
} as const

export const authForms = {
  signUp: defineForm({
    schema: signUp,
    submitLabel: "Create account",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    fields: [
      { name: "name", label: "Full name", type: "text", placeholder: "Jane Doe", autoComplete: "name", description: "" },
      emailField,
      {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "",
        autoComplete: "new-password",
        description: "At least 8 characters, with a letter and a number.",
      },
      { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "", autoComplete: "new-password", description: "" },
    ],
  }),

  login: defineForm({
    schema: login,
    submitLabel: "Sign in",
    defaultValues: { email: "", password: "" },
    fields: [
      emailField,
      { name: "password", label: "Password", type: "password", placeholder: "", autoComplete: "current-password", description: "" },
    ],
  }),

  forgotPassword: defineForm({
    schema: emailOnly,
    submitLabel: "Send reset link",
    defaultValues: { email: "" },
    fields: [emailField],
  }),

  resendVerification: defineForm({
    schema: emailOnly,
    submitLabel: "Resend verification email",
    defaultValues: { email: "" },
    fields: [emailField],
  }),

  profile: defineForm({
    schema: profile,
    submitLabel: "Save changes",
    defaultValues: { name: "", date_of_birth: "" },
    fields: [
      { name: "name", label: "Full name", type: "text", placeholder: "Jane Doe", autoComplete: "name", description: "" },
      { name: "date_of_birth", label: "Date of birth", type: "date", placeholder: "Pick a date", autoComplete: "bday", description: "" },
    ],
  }),

  resetPassword: defineForm({
    schema: resetPassword,
    submitLabel: "Update password",
    defaultValues: { password: "", confirmPassword: "" },
    fields: [
      { name: "password", label: "New password", type: "password", placeholder: "", autoComplete: "new-password", description: "" },
      { name: "confirmPassword", label: "Confirm new password", type: "password", placeholder: "", autoComplete: "new-password", description: "" },
    ],
  }),
}
