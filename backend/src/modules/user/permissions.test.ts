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

// Everything in the auth service is real except who the signed-in user is.
vi.mock("../auth/service.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../auth/service.js")>()),
  getUserFromToken: mocks.getUserFromToken
}));

import { canManageUsers, canViewUsers } from "../auth/roles.js";
import { getUser, listUsers, updateUser } from "./service.js";

const ME = "11111111-1111-4111-8111-111111111111";
const JANE = "33333333-3333-4333-8333-333333333333";
const BOSS = "99999999-9999-4999-8999-999999999999";

type Account = { role: string; flag: boolean; phone?: string };
const accounts: Record<string, Account> = {};

const authUser = (id: string) => ({
  id,
  email: `${id.slice(0, 4)}@example.com`,
  app_metadata: { role: accounts[id]?.role ?? "user" },
  user_metadata: { name: "Someone" },
  phone: accounts[id]?.phone ?? "",
  banned_until: null,
  created_at: "2026-01-01T00:00:00Z",
  email_confirmed_at: "2026-01-01T00:00:00Z"
});

/** Who is making the request. */
const session = (role: string, flag: boolean) => {
  accounts[ME] = { role, flag };
  mocks.getUserFromToken.mockResolvedValue({
    id: ME, email: "me@example.com", name: "Me", avatar_url: "", phone: "", date_of_birth: "",
    email_verified: true, role, is_super_admin: flag, is_active: true, created_at: "2026-01-01T00:00:00Z"
  });
};

const listRow = (id: string, role: string, flag: boolean) => ({
  id, email: `${id.slice(0, 4)}@example.com`, name: "", avatar_url: "", role, is_super_admin: flag, is_active: true,
  created_at: "2026-01-01T00:00:00Z"
});

beforeEach(() => {
  for (const key of Object.keys(accounts)) delete accounts[key];
  accounts[JANE] = { role: "user", flag: false };
  accounts[BOSS] = { role: "super_admin", flag: true };

  mocks.getUserFromToken.mockReset();
  mocks.updateUserById.mockReset().mockResolvedValue({ data: { user: authUser(JANE) }, error: null });
  mocks.listUsers.mockReset();
  mocks.getUserById.mockReset().mockImplementation(async (id: string) => ({ data: { user: authUser(id) }, error: null }));
  mocks.rpc.mockReset().mockImplementation(async (name: string, args?: { target?: string }) => {
    if (name === "admin_get_is_super_admin") return { data: accounts[args?.target ?? ""]?.flag ?? false, error: null };
    if (name === "admin_list_users") {
      return { data: [listRow(ME, accounts[ME]?.role ?? "user", accounts[ME]?.flag ?? false), listRow(JANE, "user", false), listRow(BOSS, "super_admin", true)], error: null };
    }
    return { data: null, error: null }; // admin_set_is_super_admin
  });
});

describe("who may see and change users", () => {
  it("view: dev or super_admin, and only with is_super_admin on", () => {
    expect(canViewUsers("super_admin", true)).toBe(true);
    expect(canViewUsers("dev", true)).toBe(true);
    expect(canViewUsers("dev", false)).toBe(false);
    expect(canViewUsers("user", true)).toBe(false);
  });

  it("change others: only the super_admin with is_super_admin on", () => {
    expect(canManageUsers("super_admin", true)).toBe(true);
    expect(canManageUsers("super_admin", false)).toBe(false);
    expect(canManageUsers("dev", true)).toBe(false);
  });
});

describe("PATCH /user/:id: your own id", () => {
  it.each(["user", "dev", "super_admin"])("%s may change their own profile", async (role) => {
    session(role, role !== "user");
    await updateUser("token", ME, { name: "New Name", date_of_birth: "2000-01-01" });

    expect(mocks.updateUserById).toHaveBeenCalledWith(
      ME,
      expect.objectContaining({ user_metadata: expect.objectContaining({ name: "New Name", date_of_birth: "2000-01-01" }) })
    );
  });

  it.each([
    [{ role: "dev" }],
    [{ is_super_admin: true }],
    [{ is_active: false }]
  ] as const)("is never allowed to change their own access: %j", async (changes) => {
    session("super_admin", true);
    await expect(updateUser("token", ME, { ...changes })).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("can't remove a saved phone number", async () => {
    session("user", false);
    accounts[ME] = { role: "user", flag: false, phone: "923001234567" };
    await expect(updateUser("token", ME, { phone: "" })).rejects.toMatchObject({ statusCode: 400, code: "PHONE_REQUIRED" });
  });
});

describe("PATCH /user/:id: someone else's id", () => {
  it.each([
    ["dev with is_super_admin on", "dev", true],
    ["dev with is_super_admin off", "dev", false],
    ["plain user", "user", false],
    ["super_admin with is_super_admin off", "super_admin", false]
  ])("is refused for: %s", async (_label, role, flag) => {
    session(role, flag);
    await expect(updateUser("token", JANE, { role: "dev" })).rejects.toMatchObject({ statusCode: 403 });
    await expect(updateUser("token", JANE, { name: "Hacked" })).rejects.toMatchObject({ statusCode: 403 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("is refused without any session", async () => {
    mocks.getUserFromToken.mockRejectedValue(Object.assign(new Error("Not authenticated"), { statusCode: 401 }));
    await expect(updateUser(undefined, JANE, { role: "dev" })).rejects.toMatchObject({ statusCode: 401 });
    expect(mocks.updateUserById).not.toHaveBeenCalled();
  });

  it("works for the super_admin: the user in the URL gets the payload", async () => {
    session("super_admin", true);
    await updateUser("token", JANE, { role: "dev", is_super_admin: true, is_active: false, name: "Jane D" });

    expect(mocks.updateUserById).toHaveBeenCalledWith(
      JANE,
      expect.objectContaining({
        user_metadata: expect.objectContaining({ name: "Jane D" }),
        app_metadata: { role: "dev" },
        ban_duration: "876000h"
      })
    );
    expect(mocks.rpc).toHaveBeenCalledWith("admin_set_is_super_admin", { target: JANE, value: true });
  });

  it("reactivates by clearing the ban", async () => {
    session("super_admin", true);
    mocks.getUserById.mockImplementation(async (id: string) => ({
      data: { user: { ...authUser(id), banned_until: id === JANE ? "2999-01-01T00:00:00Z" : null } },
      error: null
    }));
    await updateUser("token", JANE, { is_active: true });
    expect(mocks.updateUserById).toHaveBeenCalledWith(JANE, expect.objectContaining({ ban_duration: "none" }));
  });

  it("only writes what differs from now", async () => {
    session("super_admin", true);
    await updateUser("token", JANE, { role: "user", is_super_admin: false, is_active: true });

    const sent = mocks.updateUserById.mock.calls[0]?.[1];
    expect(sent).not.toHaveProperty("app_metadata");
    expect(sent).not.toHaveProperty("ban_duration");
    expect(mocks.rpc).not.toHaveBeenCalledWith("admin_set_is_super_admin", expect.anything());
  });

  it("never changes a super_admin account", async () => {
    session("super_admin", true);
    await expect(updateUser("token", BOSS, { role: "dev" })).rejects.toMatchObject({ statusCode: 403 });
  });

  it("says the migration is needed when is_super_admin can't be written yet", async () => {
    session("super_admin", true);
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
    session("user", false);
    expect((await getUser("token", ME)).id).toBe(ME);
  });

  it("a plain user can't read someone else's", async () => {
    session("user", false);
    await expect(getUser("token", JANE)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("a dev (is_super_admin on) can read others, but not a super_admin", async () => {
    session("dev", true);
    expect((await getUser("token", JANE)).id).toBe(JANE);
    await expect(getUser("token", BOSS)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("a super_admin can read everyone", async () => {
    session("super_admin", true);
    expect((await getUser("token", BOSS)).id).toBe(BOSS);
  });
});

describe("GET /user (the list)", () => {
  it("shows everyone except the signed-in user", async () => {
    session("super_admin", true);
    const page = await listUsers("token", 0, 30);
    expect(page.users.map((user) => user.id)).toEqual([JANE, BOSS]);
    expect(page).toMatchObject({ nextOffset: null, total: 2 });
  });

  it("hides super_admin accounts from every other role", async () => {
    session("dev", true);
    const page = await listUsers("token", 0, 30);
    expect(page.users.map((user) => user.id)).toEqual([JANE]);
    expect(page.total).toBe(1);
  });

  it("is refused for accounts that may not see users", async () => {
    session("user", false);
    await expect(listUsers("token", 0, 30)).rejects.toMatchObject({ statusCode: 403 });
  });

  it("still works before the SQL migration, built from the Admin API", async () => {
    session("dev", true);
    mocks.rpc.mockImplementation(async (name: string) =>
      name === "admin_list_users" ? { data: null, error: { code: "PGRST202", message: "missing" } } : { data: false, error: null }
    );
    mocks.listUsers.mockResolvedValue({
      data: {
        users: [
          { id: ME, email: "me@example.com", app_metadata: { role: "dev" }, user_metadata: {}, created_at: "2026-01-01" },
          { id: "a", email: "a@example.com", app_metadata: { role: "user" }, user_metadata: { name: "A" }, banned_until: "2999-01-01T00:00:00Z", created_at: "2026-01-02" },
          { id: "b", email: "b@example.com", app_metadata: { role: "dev" }, user_metadata: {}, created_at: "2026-01-03" }
        ]
      },
      error: null
    });

    const { users } = await listUsers("token", 0, 30);
    expect(users.map((user) => [user.id, user.role, user.is_super_admin, user.is_active])).toEqual([
      ["a", "user", false, false],
      ["b", "dev", true, true]
    ]);
  });

  it("hands out 30 at a time and says where the next page starts", async () => {
    session("super_admin", true);
    const many = Array.from({ length: 70 }, (_, index) => listRow(`u${index}`, "user", false));
    mocks.rpc.mockImplementation(async () => ({ data: [listRow(ME, "super_admin", true), ...many], error: null }));

    const first = await listUsers("token", 0, 30);
    expect(first.users).toHaveLength(30);
    expect(first).toMatchObject({ nextOffset: 30, total: 70 });

    const last = await listUsers("token", 60, 30);
    expect(last.users).toHaveLength(10);
    expect(last.nextOffset).toBeNull();
  });
});
