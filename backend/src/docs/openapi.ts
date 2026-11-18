
const authUserSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", example: "6f1c7d1e-5a0b-4c55-9d1e-0c2f6e7a1b11" },
    email: { type: "string", format: "email", example: "jane@example.com" },
    name: { type: "string", example: "Jane Doe" },
    avatar_url: {
      type: "string",
      description: "Public URL of the profile photo in the `profile` storage bucket; empty when none is set.",
      example: "https://xyz.supabase.co/storage/v1/object/public/profile/6f1c7d1e/avatar-1.png"
    },
    phone: { type: "string", description: "From the auth user's `phone` field, with a leading +. Empty when not set.", example: "+923001234567" },
    date_of_birth: { type: "string", description: "YYYY-MM-DD. Empty when not set.", example: "1995-04-21" },
    email_verified: { type: "boolean", example: true },
    is_active: { type: "boolean", example: true, description: "false while the account is deactivated and cannot sign in." },
    created_at: { type: "string", format: "date-time" },
    roles: {
      type: "array",
      items: { type: "string", enum: ["user", "dev"] },
      description: "Stored in Supabase app_metadata (`roles` only). Always contains `user`; `dev` is optional. New accounts are `[\"user\"]`.",
      example: ["user"]
    },
    is_super_admin: {
      type: "boolean",
      description: "The auth.users.is_super_admin column. When true the account has super admin access (can open the Users page and change other users). It is not a role: toggled from the Users page, independent of `roles`. Read through a SQL function (see the migration).",
      example: false
    }
  },
  required: ["id", "email", "name", "avatar_url", "phone", "date_of_birth", "email_verified", "roles", "is_super_admin", "is_active", "created_at"]
};

const errorSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    code: { type: "string", example: "INVALID_CREDENTIALS" },
    message: { type: "string", example: "Invalid email or password" }
  },
  required: ["success", "code", "message"]
};

const messageSchema = (message: string) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: message }
  },
  required: ["success", "message"]
});

const userResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    data: {
      type: "object",
      properties: { user: authUserSchema },
      required: ["user"]
    }
  },
  required: ["success", "data"]
};

const json = (schema: Record<string, unknown>) => ({
  "application/json": { schema }
});

const jsonBody = (schema: Record<string, unknown>) => ({
  required: true,
  content: json(schema)
});

const errorResponse = (description: string, code: string) => ({
  description,
  content: json({
    ...errorSchema,
    properties: {
      ...errorSchema.properties,
      code: { type: "string", example: code }
    }
  })
});

const validationError = errorResponse(
  "Validation failed. `message` has the first problem.",
  "VALIDATION_ERROR"
);

const rateLimited = errorResponse("Too many requests.", "RATE_LIMITED");

const sessionCookies =
  "Sets httpOnly `access_token` and `refresh_token` cookies. The browser sends them back automatically (use `withCredentials: true`).";

const managedUserSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    email: { type: "string", format: "email", example: "jane@example.com" },
    name: { type: "string", example: "Jane Doe" },
    avatar_url: { type: "string", description: "Empty when none." },
    roles: { type: "array", items: { type: "string", enum: ["user", "dev"] }, example: ["user", "dev"] },
    is_super_admin: { type: "boolean", example: false },
    is_active: { type: "boolean", example: true, description: "false while the account is deactivated (banned) and cannot sign in." },
    created_at: { type: "string", format: "date-time" }
  },
  required: ["id", "email", "name", "avatar_url", "roles", "is_super_admin", "is_active", "created_at"]
};

const userIdParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" }
};

const forbidden = errorResponse("Not allowed for this account.", "FORBIDDEN");

const userPaths = {
  "/user": {
    get: {
      tags: ["User"],
      summary: "List users (paged)",
      description:
        "Everyone except the signed-in user, oldest account first, 30 per page. Pass the `nextOffset` of one response as `offset` of the next request until it is `null`. Allowed only while the signed-in account has `is_super_admin` on.",
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      parameters: [
        { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 30 } }
      ],
      responses: {
        "200": {
          description: "One page of users",
          content: json({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  users: { type: "array", items: managedUserSchema },
                  nextOffset: { type: "integer", nullable: true, example: 30, description: "null on the last page" },
                  total: { type: "integer", example: 72 }
                },
                required: ["users", "nextOffset", "total"]
              }
            },
            required: ["success", "data"]
          })
        },
        "401": errorResponse("Not signed in or the session expired.", "UNAUTHENTICATED"),
        "403": forbidden
      }
    }
  },
  "/user/{id}": {
    get: {
      tags: ["User"],
      summary: "Read one user",
      description:
        "The user is the `id` in the URL. Your own id always works. Someone else's needs the same access as the list (`is_super_admin` on).",
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      parameters: [userIdParam],
      responses: {
        "200": { description: "The user", content: json(userResponseSchema) },
        "401": errorResponse("Not signed in or the session expired.", "UNAUTHENTICATED"),
        "403": forbidden,
        "404": errorResponse("No such user.", "NOT_FOUND")
      }
    },
    patch: {
      tags: ["User"],
      summary: "Update one user",
      description:
        "The user is the `id` in the URL; the payload is what to change (send only those fields, as JSON, or as `multipart/form-data` when there is an `avatar` image).\n\n" +
        "**Your own id:** you may change `name`, `date_of_birth`, `phone` and `avatar`. Your own `roles`, `is_super_admin` and `is_active` can never be changed.\n\n" +
        "**Someone else's id:** only an account with `is_super_admin` on may, for any field. `roles` is a list of `user` and optionally `dev`: `user` is always kept, and there is no `super_admin` role (use `is_super_admin`). Values equal to the current ones are ignored.\n\n" +
        "Storage: `name`, `date_of_birth` and the photo URL go in the user's auth metadata, `phone` in the auth user's own `phone` (a saved phone can be replaced, not removed), `roles` in `app_metadata`, `is_active` as a ban, `is_super_admin` in `auth.users.is_super_admin`. The `avatar` image (JPG, PNG or WebP, max 2 MB) replaces `<user id>/avatar` in the public `profile` bucket.",
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      parameters: [userIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", minLength: 2, maxLength: 80, example: "Jane Doe" },
                date_of_birth: { type: "string", description: "YYYY-MM-DD, a past date. Empty to clear.", example: "1995-04-21" },
                phone: { type: "string", description: "Country code first, like +92 300 1234567.", example: "+92 300 1234567" },
                roles: { type: "array", items: { type: "string", enum: ["user", "dev"] }, description: "`user` is always kept; add `dev` for the optional dev role.", example: ["user", "dev"] },
                is_super_admin: { type: "boolean", example: true },
                is_active: { type: "boolean", example: true, description: "false deactivates the account: it can no longer sign in." }
              }
            }
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string", example: "Jane Doe" },
                date_of_birth: { type: "string", example: "1995-04-21" },
                avatar: { type: "string", format: "binary", description: "Optional JPG, PNG or WebP, max 2 MB." }
              }
            }
          }
        }
      },
      responses: {
        "200": { description: "The updated user", content: json(userResponseSchema) },
        "400": errorResponse("Validation failed, nothing to update, or the file is not a JPG, PNG or WebP image under 2 MB.", "VALIDATION_ERROR"),
        "401": errorResponse("Not signed in or the session expired.", "UNAUTHENTICATED"),
        "403": forbidden,
        "404": errorResponse("No such user.", "NOT_FOUND"),
        "409": errorResponse("Another account already uses this phone number.", "PHONE_TAKEN"),
        "503": errorResponse("is_super_admin can't be changed until the SQL migration has been run.", "MIGRATION_REQUIRED")
      }
    }
  }
};

const emailField = { type: "string", format: "email", example: "jane@example.com" };
const passwordRules =
  "8 to 72 characters, with at least one letter and one number.";

const authPaths = {
  "/auth/signup": {
    post: {
      tags: ["Auth"],
      summary: "Create an account",
      description:
        "Creates the account and sends a verification email. The user cannot sign in until the email is verified. Every new account gets `role: user` in `app_metadata`. Limited to 5 requests per 15 minutes per IP (not enforced in development).",
      requestBody: jsonBody({
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, maxLength: 80, example: "Jane Doe" },
          email: emailField,
          password: { type: "string", description: passwordRules, example: "Secret123" }
        },
        required: ["name", "email", "password"]
      }),
      responses: {
        "201": {
          description: "Account created. `verificationRequired` is `false` only if email confirmation is switched off in Supabase, in which case the user is already signed in.",
          content: json({
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Account created. Check your email to verify your address." },
              data: {
                type: "object",
                properties: {
                  user: { ...authUserSchema, nullable: true },
                  verificationRequired: { type: "boolean", example: true }
                },
                required: ["user", "verificationRequired"]
              }
            },
            required: ["success", "message", "data"]
          })
        },
        "400": validationError,
        "409": errorResponse("An account with this email already exists.", "EMAIL_TAKEN"),
        "429": rateLimited
      }
    }
  },
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Sign in",
      description: `${sessionCookies} Limited to 5 requests per 15 minutes per IP (not enforced in development).`,
      requestBody: jsonBody({
        type: "object",
        properties: {
          email: emailField,
          password: { type: "string", example: "Secret123" }
        },
        required: ["email", "password"]
      }),
      responses: {
        "200": { description: "Signed in", content: json(userResponseSchema) },
        "400": validationError,
        "401": errorResponse("Wrong email or password.", "INVALID_CREDENTIALS"),
        "403": errorResponse("The email has not been verified yet.", "EMAIL_NOT_VERIFIED"),
        "429": rateLimited
      }
    }
  },
  "/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Current user",
      description:
        "Returns the signed-in user. Reads the `access_token` cookie, or an `Authorization: Bearer <token>` header.",
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
      responses: {
        "200": { description: "The current user", content: json(userResponseSchema) },
        "401": errorResponse("Not signed in or the session expired.", "UNAUTHENTICATED"),
        "403": errorResponse("The email has not been verified yet.", "EMAIL_NOT_VERIFIED")
      }
    }
  },
  "/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Refresh the session",
      description: `Uses the \`refresh_token\` cookie to issue a new session. ${sessionCookies}`,
      security: [{ refreshCookie: [] }],
      responses: {
        "200": { description: "Session refreshed", content: json(userResponseSchema) },
        "401": errorResponse("Refresh token missing, invalid or expired.", "UNAUTHENTICATED")
      }
    }
  },
  "/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Sign out",
      description: "Revokes the session and clears both cookies. Always succeeds.",
      responses: {
        "200": { description: "Signed out", content: json(messageSchema("Signed out")) }
      }
    }
  },
  "/auth/verify-email": {
    post: {
      tags: ["Auth"],
      summary: "Verify an email address",
      description:
        "Called by the frontend with the values from the verification link. Send either `tokenHash`, or both `accessToken` and `refreshToken`. Fields you do not use must be sent as empty strings. On success the user is signed in. " +
        sessionCookies,
      requestBody: jsonBody({
        type: "object",
        properties: {
          accessToken: { type: "string", example: "" },
          refreshToken: { type: "string", example: "" },
          tokenHash: { type: "string", example: "" }
        },
        required: ["accessToken", "refreshToken", "tokenHash"]
      }),
      responses: {
        "200": { description: "Email verified and signed in", content: json(userResponseSchema) },
        "400": errorResponse("The link is invalid or has expired.", "INVALID_TOKEN")
      }
    }
  },
  "/auth/resend-verification": {
    post: {
      tags: ["Auth"],
      summary: "Resend the verification email",
      description:
        "Always answers with success, so it cannot be used to find out which emails are registered. Limited to 3 requests per 15 minutes per IP (not enforced in development).",
      requestBody: jsonBody({
        type: "object",
        properties: { email: emailField },
        required: ["email"]
      }),
      responses: {
        "200": {
          description: "Request accepted",
          content: json(messageSchema("If this email needs verification, a new link has been sent."))
        },
        "400": validationError,
        "429": rateLimited
      }
    }
  },
  "/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Send a password reset email",
      description:
        "Always answers with success, so it cannot be used to find out which emails are registered. Limited to 3 requests per 15 minutes per IP (not enforced in development).",
      requestBody: jsonBody({
        type: "object",
        properties: { email: emailField },
        required: ["email"]
      }),
      responses: {
        "200": {
          description: "Request accepted",
          content: json(messageSchema("If an account exists for this email, a reset link has been sent."))
        },
        "400": validationError,
        "429": rateLimited
      }
    }
  },
  "/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Set a new password",
      description:
        "Called by the frontend with the values from the reset link. Send either `tokenHash` or `accessToken`; send the unused one as an empty string.",
      requestBody: jsonBody({
        type: "object",
        properties: {
          accessToken: { type: "string", example: "" },
          tokenHash: { type: "string", example: "" },
          password: { type: "string", description: passwordRules, example: "NewSecret123" }
        },
        required: ["accessToken", "tokenHash", "password"]
      }),
      responses: {
        "200": {
          description: "Password updated",
          content: json(messageSchema("Password updated. You can now sign in."))
        },
        "400": errorResponse("The link is invalid or has expired, or the password is too weak.", "INVALID_TOKEN")
      }
    }
  }
};

export const openApiDocument: Record<string, unknown> = {
  openapi: "3.1.0",
  info: {
    title: "AdSync API",
    version: "1.0.0",
    description:
      "Backend API powering Google Ads campaign management.\n\nAuthentication uses httpOnly cookies set by `/auth/login`. Every error looks like `{ success: false, code, message }`."
  },
  servers: [{ url: "/api" }],
  tags: [{ name: "Auth" }, { name: "User" }],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "access_token" },
      refreshCookie: { type: "apiKey", in: "cookie", name: "refresh_token" },
      bearerAuth: { type: "http", scheme: "bearer" }
    }
  },
  paths: {
    ...authPaths,
    ...userPaths
  }
};
