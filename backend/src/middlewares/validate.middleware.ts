import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

import { HttpError } from "../utils/http-error.js";

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request";
      return next(new HttpError(400, message, "VALIDATION_ERROR"));
    }

    req.body = result.data;
    next();
  };
