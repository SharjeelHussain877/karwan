
import type { Request, Response, NextFunction } from "express";

export const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: "Resource not found",
    path: req.originalUrl
  });
};
