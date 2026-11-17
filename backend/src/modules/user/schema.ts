import { z } from "zod";

import { ASSIGNABLE_ROLES } from "../auth/roles.js";

export const USERS_PAGE_SIZE = 30;

export const userIdSchema = z.string().uuid("Invalid user id");

/** GET /user?offset=0&limit=30 */
export const listQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(USERS_PAGE_SIZE)
});

/** A multipart form sends booleans as the text "true" / "false"; JSON sends real booleans. */
const flag = (message: string) =>
  z.union([z.boolean(), z.enum(["true", "false"]).transform((value) => value === "true")], message);

const date_of_birth = z
  .string()
  .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), "Enter a valid date")
  .refine(
    (value) => value === "" || (new Date(value) <= new Date() && value >= "1900-01-01"),
    "Date of birth must be a past date"
  );

/**
 * PATCH /user/:id. Send only the fields to change.
 *
 * Profile fields (anyone for their own id, the super_admin for anyone's):
 *   name, date_of_birth, phone and an `avatar` image (multipart).
 * Access fields (the super_admin only, never for their own id):
 *   role, is_super_admin, is_active. "super_admin" is not an assignable role.
 */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
    date_of_birth: date_of_birth.optional(),
    // Spaces, dashes and brackets are dropped; what is left must be +<country code><number>.
    phone: z
      .string()
      .transform((value) => value.replace(/[\s\-()]/g, ""))
      .refine(
        (value) => value === "" || /^\+[1-9]\d{6,14}$/.test(value),
        "Enter your phone number with the country code, like +92 300 1234567"
      )
      .optional(),
    role: z.enum(ASSIGNABLE_ROLES, "Role must be user or dev").optional(),
    is_super_admin: flag("is_super_admin must be true or false").optional(),
    is_active: flag("is_active must be true or false").optional()
  })
  .strict();
