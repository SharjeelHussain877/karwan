import { beforeEach, describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({
  signUp: vi.fn(),
  updateUserById: vi.fn()
}));

vi.mock("../../constants/index.js", () => ({
  ENV: {
    LOG_LEVEL: "silent",
    CLIENT_URL: "http://localhost:5173",
    SUPABASE_URL: "http://localhost",
    SUPABASE_PUBLISHABLE_KEY: "pub",
    SUPABASE_SECRET_KEY: "secret"
  }
}));

vi.mock("../../config/supabase.js", () => ({
  supabasePublic: () => ({ auth: { signUp: supabase.signUp } }),
  supabaseAdmin: () => ({
    auth: { admin: { updateUserById: supabase.updateUserById } },
    rpc: async () => ({ data: false, error: null })
  })
}));

import { signUpSchema } from "./schema.js";
import { signUp } from "./service.js";

const newUser = {
  id: "u1",
  email: "jane@example.com",
  identities: [{}],
  app_metadata: {},
  user_metadata: { name: "Jane" },
  email_confirmed_at: null,
  phone: ""
};

beforeEach(() => {
  supabase.signUp.mockReset().mockResolvedValue({ data: { user: newUser, session: null }, error: null });
  supabase.updateUserById.mockReset().mockResolvedValue({ data: { user: newUser }, error: null });
});

describe("sign up never takes a role from the client", () => {
  const base = { name: "Jane", email: "jane@example.com", password: "Secret123" };

  it("accepts name, email and password", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it.each(["role", "roles", "app_metadata", "is_super_admin"])("rejects a %s field", (field) => {
    expect(signUpSchema.safeParse({ ...base, [field]: "super_admin" }).success).toBe(false);
  });

  it("always creates the account as a plain user, whatever was passed in", async () => {
    const sneaky = { ...base, role: "super_admin", app_metadata: { role: "super_admin" } };
    await signUp(sneaky);

    const call = supabase.signUp.mock.calls[0];
    expect(call).toBeDefined();
    expect(call![0].options.data).toEqual({ name: "Jane" });

    expect(supabase.updateUserById).toHaveBeenCalledTimes(1);
    expect(supabase.updateUserById).toHaveBeenCalledWith("u1", { app_metadata: { roles: ["user"] } });
  });
});
