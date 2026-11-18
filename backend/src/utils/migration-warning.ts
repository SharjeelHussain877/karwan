import logger from "./logger.js";

const warned = new Set<string>();

export const warnMigrationMissing = (fn: string): void => {
  if (warned.has(fn)) return;
  warned.add(fn);
  logger.warn(
    `${fn} is missing. Run backend/supabase/migrations/20261118000000_auth_setup.sql once in the Supabase SQL Editor. Until then is_super_admin falls back to the role (dev and super_admin = on) and cannot be toggled.`
  );
};
