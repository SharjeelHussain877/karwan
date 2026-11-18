import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserFromToken: vi.fn(),
  updateUserById: vi.fn(),
  rpc: vi.fn(),
  listUsers: vi.fn(),
  getUserById: vi.fn()
}));

vi.mock("../../constants/index.js", () => ({
  ENV: {
    LOG_LEVEL: "silent",
    CLIENT_URL: "http://localhost:5173",
    SUPABASE_URL: "http://localhost",
    SUPABASE_PUBLISHABLE_KEY: "p",
    SUPABASE_SECRET_KEY: "s"
  }
}));

vi.mock("../../config/supabase.js", () => ({
  supabasePublic: () => ({}),
  supabaseAdmin: () => ({
    rpc: mocks.rpc,
    auth: { admin: { getUserById: mocks.getUserById, updateUserById: mocks.updateUserById, listUsers: mocks.listUsers } }
  })
}));

vi.mock("../auth/service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../auth/service.js")>()),
  getUserFromToken: mocks.getUserFromToken
}));

import { ROLES, canManageUsers, canViewUsers, isValidRoles, readAppMetadata } from "../auth/roles.js";
import { updateUserSchema } from "./schema.js";
import { getUser, listUsers, updateUser } from "./service.js";

const ME = "11111111-1111-4111-8111-111111111111";
const JANE = "33333333-3333-4333-8333-333333333333";
const BOSS = "99999999-9999-4999-8999-999999999999";

type Account = { roles: string[]; flag: boolean; phone?: string };
const accounts: Record<string, Account> = {};

const authUser = (id: string) => ({
  id,
  email: `${id.slice(0, 4)}@example.com`,
  app_metadata: { roles: accounts[id]?.roles ?? ["user"] },
  user_metadata: { name: "Someone" },
  phone: accounts[id]?.phone ?? "",
  banned_until: null,
  created_at: "2026-01-01T00:00:00Z",
  email_confirmed_at: "2026-01-01T00:00:00Z"
});

const session = (roles: string[], flag: boolean) => {
  accounts[ME] = { roles, flag };
  mocks.getUserFromToken.mockResolvedValue({
    id: ME, email: "me@example.com", name: "Me", avatar_url: "", phone: "", date_of_birth: "",
    email_verified: true, roles, is_super_admin: flag, is_active: true, created_at: "2026-01-01T00:00:00Z"
  });
};

const listRow = (id: string, roles: string[], flag: boolean) => ({
  id, email: `${id.slice(0, 4)}@example.com`, name: "", avatar_url: "", roles, is_super_admin: flag, is_active: true,
  created_at: "2026-01-01T00:00:00Z"
});

beforeEach(() => {
  for (const key of Object.keys(accounts)) delete accounts[key];
  accounts[JANE] = { roles: ["user"], flag: false };
  accounts[BOSS] = { roles: ["user"], flag: true };

  mocks.getUserFromToken.mockReset();
  mocks.updateUserById.mockReset().mockResolvedValue({ data: { user: authUser(JANE) }, error: null });
  mocks.listUsers.mockReset();
  mocks.getUserById.mockReset().mockImplementation(async (id: string) => ({ data: { user: authUser(id) }, error: null }));
  mocks.rpc.mockReset().mockImplementation(async (name: string, args?: { target?: string }) => {
    if (name === "admin_get_is_super_admin") return { data: accounts[args?.target ?? ""]?.flag ?? false, error: null };
    if (name === "admin_list_users") {
      return { data: [listRow(ME, accounts[ME]?.roles ?? ["user"], accounts[ME]?.flag ?? false), listRow(JANE, ["user"], false), listRow(BOSS, ["user"], true)], error: null };
    }
    return { data: null, error: null };
  });
});

describe("who may see and change users", () => {
  it("super admin access is the is_super_admin flag, not a role", () => {
    expect(canViewUsers(true)).toBe(true);
    expect(canViewUsers(false)).toBe(false);
    expect(canManageUsers(true)).toBe(true);
    expect(canManageUsers(false)).toBe(false);
  });
});

describe("roles", () => {
  it("only user and dev exist", () => {
    expect(ROLES).toEqual(["user", "dev"]);
  });

  it("matches exactly [user] or [user, dev] and nothing else", () => {
    expect(isValidRoles(["user"])).toBe(true);
    expect(isValidRoles(["user", "dev"])).toBe(true);
    expect(isValidRoles([])).toBe(false);
    expect(isValidRoles(["dev"])).toBe(false);
    expect(isValidRoles(["dev", "user"])).toBe(false);
    expect(isValidRoles(["user", "user"])).toBe(false);
    expect(isValidRoles(["user", "dev", "dev"])).toBe(false);
  });

  it("the update payload is rejected unless the roles match", () => {
    expect(updateUserSchema.safeParse({ roles: ["user"] }).success).toBe(true);
    expect(updateUserSchema.safeParse({ roles: ["user", "dev"] }).success).toBe(true);
    expect(updateUserSchema.safeParse({ roles: [] }).success).toBe(false);
    expect(updateUserSchema.safeParse({ roles: ["dev"] }).success).toBe(false);
    expect(updateUserSchema.safeParse({ roles: ["super_admin"] }).success).toBe(false);
    expect(updateUserSchema.safeParse({ roles: "user" }).success).toBe(false);
    expect(updateUserSchema.safeParse({ role: "dev" }).success).toBe(false);
  });

  it("reads stored roles, and falls back to user when they are missing or not as expected", () => {
    expect(readAppMetadata({ roles: ["user", "dev"] })).toEqual({ roles: ["user", "dev"] });
    expect(readAppMetadata({ roles: ["dev"] })).toEqual({ roles: ["user"] });
    expect(readAppMetadata({})).toEqual({ roles: ["user"] });
  });
});

describe("PATCH /user/:id: your own id", () => {
  it.each([
    ["a plain user", ["user"], false],
    ["a dev", ["user", "dev"], false],
    ["a super admin", ["user"], true]
  ] as const)("%s may change their own profile", async (_label, roles, flag) => {
    session([...roles], flag);
    await updateUser("token", ME, { name: "New Name", date_of_birth: "2000-01-01" });

    expect(mocks.updateUserById).toHaveBeenCalledWith(
      ME,
      expect.objectContaining({ user_metadata: expect.objectContaining({ name: "New Name", date_of_birth: "2000-01-01" }) })
    );
  });

  it.each([
    [{ roles: ["user", "dev"] }],
    [{ is_super_admin: true }],
    [{ is_active: false }]
  ] as const)("is never allowed to change their own access: %j", async (changes) => {
    session(["user"], true);
    await expect(updateUser("token", ME, changes as Parameters<typeof updateUser>[2])).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("can't remove a saved phone number", async () => {
    session(["user"], false);
    accounts[ME] = { roles: ["user"], flag: false, phone: "923001234567" };
    await expect(updateUser("token", ME, { phone: "" })).rejects.toMatchObject({ statusCode: 400, code: "PHONE_REQUIRED" });
  });
});

describe("PATCH /user/:id: someone else's id", () => {
  it.each([
    ["dev with is_super_admin off", ["user", "dev"], false],
    ["plain user", ["user"], false]
  ])("is refused for: %s", async (_label, roles, flag) => {
    session(roles, flag);
    await expect(updateUser("token", JANE, { roles: ["user", "dev"] })).rejects.toMatchObject({ statusCode: 403 });
    await expect(updateUser("token", JANE, { name: "Hacked" })).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("is refused without any session", async () => {
    mocks.getUserFromToken.mockRejectedValue(Object.assign(new Error("Not authenticated"), { statusCode: 401 }));
    await expect(updateUser(undefined, JANE, { roles: ["user", "dev"] })).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("works for a super admin: the user in the URL gets the payload", async () => {
    session(["user"], true);
    await updateUser("token", JANE, { roles: ["user", "dev"], is_super_admin: true, is_active: false, name: "Jane D" });

    expect(mocks.updateUserById).toHaveBeenCalledWith(
      JANE,
      expect.objectContaining({
        user_metadata: expect.objectContaining({ name: "Jane D" }),
        app_metadata: { roles: ["user", "dev"] },
        ban_duration: "876000h"
      })
    );
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_is_super_admin", { target: JANE, value: true });
  });

  it("reactivates by clearing the ban", async () => {
    session(["user"], true);
    mocks.getUserById.mockImplementation(async (id: string) => ({
      data: { user: { ...authUser(id), banned_until: id === JANE ? "2999-01-01T00:00:00Z" : null } },
      error: null
    }));
    await updateUser("token", JANE, { is_active: true });
    expect(mocks.updateUserById).toHaveBeenCalledWith(JANE, expect.objectContaining({ ban_duration: "none" }));
  });

  it("only writes what differs from now", async () => {
    session(["user"], true);
    await updateUser("token", JANE, { roles: ["user"], is_super_admin: false, is_active: true });

    const sent = mocks.updateUserById.mock.calls[0]?.[1];
    expect(sent).not.toHaveProperty("app_metadata");
    expect(sent).not.toHaveProperty("ban_duration");
    expect(mocks.rpc).not.toHaveBeenCalledWith("admin_set_is_super_admin", expect.anything());
  });

  it("can change another super admin", async () => {
    session(["user"], true);
    await updateUser("token", BOSS, { is_super_admin: false });
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_is_super_admin", { target: BOSS, value: false });
  });

  it("keeps user when roles are set, and removes dev when it is left out", async () => {
    session(["user"], true);
    accounts[JANE] = { roles: ["user", "dev"], flag: false };
    await updateUser("token", JANE, { roles: ["user"] });
    expect(mocks.updateUserById).toHaveBeenCalledWith(
      JANE,
      expect.objectContaining({ app_metadata: { roles: ["user"] } })
    );
  });

  it("says the migration is needed when is_super_admin can't be written yet", async () => {
    session(["user"], true);
    mocks.rpc.mockImplementation(async (name: string) =>
      name === "admin_set_is_super_admin" ? { data: null, error: { code: "PGRST202", message: "missing" } } : { data: false, error: null }
    );
    await expect(updateUser("token", JANE, { is_super_admin: true })).rejects.toMatchObject({
      statusCode: 503,
      code: "MIGRATION_REQUIRED"
    });
  });
});

describe("GET /user/:id", () => {
  it("anyone can read their own", async () => {
    session(["user"], false);
    expect((await getUser("token", ME)).id).toBe(ME);
  });

  it("a plain user can't read someone else's", async () => {
    session(["user"], false);
    await expect(getUser("token", JANE)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("a dev without is_super_admin can't read others", async () => {
    session(["user", "dev"], false);
    await expect(getUser("token", JANE)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("a super admin can read everyone", async () => {
    session(["user"], true);
    expect((await getUser("token", BOSS)).id).toBe(BOSS);
  });
});

describe("GET /user (the list)", () => {
  it("shows everyone except the signed-in user", async () => {
    session(["user"], true);
    const page = await listUsers("token", 0, 30);
    expect(page.users.map((user) => user.id)).toEqual([JANE, BOSS]);
    expect(page).toMatchObject({ nextOffset: null, total: 2 });
  });

  it("is refused for accounts that may not see users", async () => {
    session(["user"], false);
    await expect(listUsers("token", 0, 30)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("still works before the SQL migration, built from the Admin API", async () => {
    session(["user"], true);
    mocks.rpc.mockImplementation(async (name: string) =>
      name === "admin_list_users" ? { data: null, error: { code: "PGRST202", message: "missing" } } : { data: false, error: null }
    );
    mocks.listUsers.mockResolvedValue({
      data: {
        users: [
          { id: ME, email: "me@example.com", app_metadata: { roles: ["user"] }, user_metadata: {}, created_at: "2026-01-01" },
          { id: "a", email: "a@example.com", app_metadata: { roles: ["user"] }, user_metadata: { name: "A" }, banned_until: "2999-01-01T00:00:00Z", created_at: "2026-01-02" },
          { id: "b", email: "b@example.com", app_metadata: { roles: ["user", "dev"] }, user_metadata: {}, created_at: "2026-01-03" }
        ]
      },
      error: null
    });

    const { users } = await listUsers("token", 0, 30);
    expect(users.map((user) => [user.id, user.roles, user.is_super_admin, user.is_active])).toEqual([
      ["a", ["user"], false, false],
      ["b", ["user", "dev"], false, true]
    ]);
  });

  it("hands out 30 at a time and says where the next page starts", async () => {
    session(["user"], true);
    const many = Array.from({ length: 70 }, (_, index) => listRow(`u${index}`, ["user"], false));
    mocks.rpc.mockImplementation(async () => ({ data: [listRow(ME, ["user"], true), ...many], error: null }));

    const first = await listUsers("token", 0, 30);
    expect(first.users).toHaveLength(30);
    expect(first).toMatchObject({ nextOffset: 30, total: 70 });

    const last = await listUsers("token", 60, 30);
    expect(last.users).toHaveLength(10);
    expect(last.nextOffset).toBeNull();
  });
});
