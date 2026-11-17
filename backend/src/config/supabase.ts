import { createClient } from "@supabase/supabase-js";

import { ENV } from "../constants/index.js";

const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

/**
 * A fresh, stateless client per call so one user's session can never leak into
 * another request.
 */
export const supabasePublic = () =>
  createClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, options);

/** Admin client (secret key). Server-side only. */
export const supabaseAdmin = () =>
  createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, options);
