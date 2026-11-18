
import type {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler
  } from "express";
  
  import { HttpError } from "../utils/http-error.js";
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
  
    const code =
      "code" in err && typeof err.code === "string" ? err.code : "ERROR";

    res.status(statusCode).json({
      success: false,
      code,
      message:
        statusCode >= 500 && !(err instanceof HttpError)
          ? "Internal Server Error"
          : err.message,
      ...(process.env.NODE_ENV === "development" && {
        stack: err.stack
      })
    });
  };
  