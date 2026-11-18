import "dotenv/config";

import type { User } from "@supabase/supabase-js";

import { supabaseAdmin } from "../config/supabase.js";
import { buildAppMetadata, type Role } from "../modules/auth/roles.js";

type SeedUser = { name: string; email: string; password: string; roles: Role[]; is_super_admin: boolean };

const SEED_USERS: SeedUser[] = [
  {
    name: "Super Admin",
    email: "dev.sharjeelhussain@gmail.com",
    password: "Shar@123",
    roles: ["user"],
    is_super_admin: true
  },
  {
    name: "Dev",
    email: "fakhiriqbal53@gmail.com",
    password: "Shar@123",
    roles: ["user", "dev"],
    is_super_admin: false
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
    app_metadata: buildAppMetadata(seed.roles)
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

  const { error: flagError } = await supabaseAdmin().rpc("admin_set_is_super_admin", {
    target: data.user.id,
    value: seed.is_super_admin
  });
  if (flagError) {
    console.warn(`  could not set is_super_admin for ${seed.email}: run the SQL migration first`);
  }
  return "created";
};

const run = async () => {
  for (const seed of SEED_USERS) {
    const result = await seedUser(seed);
    console.log(`${result.padEnd(8)} ${seed.email}  roles=${seed.roles.join(",")}  is_super_admin=${seed.is_super_admin}`);
  }
};

run().catch((error: Error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
