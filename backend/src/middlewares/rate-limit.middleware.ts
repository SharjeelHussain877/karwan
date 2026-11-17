
import rateLimit from "express-rate-limit";

const createRateLimiter = (
  windowMs: number,
  limit: number,
  label: string
) => {
  const minutes = Math.round(windowMs / 60000);
  const unit = minutes === 1 ? "minute" : "minutes";

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "development",
    message: {
      success: false,
      code: "RATE_LIMITED",
      message: `Too many ${label}. Please try again in ${minutes} ${unit}.`
    }
  });
};

// General API: 100 requests / 15 minutes
export const globalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  "requests"
);

// Authentication: 5 requests / 15 minutes
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  "authentication attempts"
);

// Sensitive operations: 3 requests / 15 minutes
export const sensitiveLimiter = createRateLimiter(
  15 * 60 * 1000,
  3,
  "attempts"
);
