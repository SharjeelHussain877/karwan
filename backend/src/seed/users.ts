import "dotenv/config";

import type { User } from "@supabase/supabase-js";

import { supabaseAdmin } from "../config/supabase.js";
import { buildAppMetadata, isSuperAdminRole, type Role } from "../modules/auth/roles.js";

/**
 * Seeds the built-in accounts. Safe to run any number of times: existing
 * accounts are updated (password, role, verified email) instead of duplicated.
 * "super_admin" is never assigned through the app, only here.
 *
 *   npm run seed
 *
 * Change these passwords after the first sign-in.
 */
type SeedUser = { name: string; email: string; password: string; role: Role };

const SEED_USERS: SeedUser[] = [
  {
    name: "Super Admin",
    email: "dev.sharjeelhussain@gmail.com",
    password: "Shar@123",
    role: "super_admin"
  },
  {
    name: "Dev",
    email: "fakhiriqbal53@gmail.com",
    password: "Shar@123",
    role: "dev"
  }
];

const findByEmail = async (email: string): Promise<User | null> => {
  const perPage = 1000;
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) return null;
  }
};

const seedUser = async (seed: SeedUser): Promise<"created" | "updated"> => {
  const attributes = {
    password: seed.password,
    email_confirm: true,
    user_metadata: { name: seed.name },
    app_metadata: buildAppMetadata(seed.role)
  };

  const existing = await findByEmail(seed.email);

  if (existing) {
    const { error } = await supabaseAdmin().auth.admin.updateUserById(existing.id, attributes);
    if (error) throw error;
    return "updated";
  }

  const { data, error } = await supabaseAdmin().auth.admin.createUser({
    email: seed.email,
    ...attributes
  });
  if (error) throw error;

  // New seed accounts start with is_super_admin on. An existing account keeps
  // whatever it was toggled to. (The column is only reachable through SQL.)
  const { error: flagError } = await supabaseAdmin().rpc("admin_set_is_super_admin", {
    target: data.user.id,
    value: isSuperAdminRole(seed.role)
  });
  if (flagError) {
    console.warn(`  could not set is_super_admin for ${seed.email}: run the SQL migration first`);
  }
  return "created";
};

const run = async () => {
  for (const seed of SEED_USERS) {
    const result = await seedUser(seed);
    console.log(`${result.padEnd(8)} ${seed.email}  role=${seed.role}  is_super_admin=${isSuperAdminRole(seed.role)}`);
  }
};

run().catch((error: Error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
