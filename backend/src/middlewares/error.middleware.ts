
import type {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler
  } from "express";
  
  import logger from "../utils/logger.js";
  
  export const errorHandler: ErrorRequestHandler = (
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    const err = error instanceof Error
      ? error
      : new Error("Internal Server Error");
  
    const statusCode =
      "statusCode" in err &&
      typeof err.statusCode === "number"
        ? err.statusCode
        : 500;
  
    logger.error(
      {
        error: err,
        method: req.method,
        path: req.originalUrl
      },
      "Request error"
    );
  
    res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? "Internal Server Error"
          : err.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack
      })
    });
  };
  