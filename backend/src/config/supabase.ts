import { createClient } from "@supabase/supabase-js";

import { ENV } from "../constants/index.js";

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

export const supabasePublic = () =>
  createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, options);

export const supabaseAdmin = () =>
  createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, options);
