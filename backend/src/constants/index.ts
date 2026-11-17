import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(9090),

  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("debug"),

  CLIENT_URL: z.string().default("http://localhost:8080"),
});

export const ENV = envSchema.parse(process.env);