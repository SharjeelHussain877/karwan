import { describe, expect, it, vi } from "vitest";

vi.mock("../constants/index.js", () => ({ ENV: { LOG_LEVEL: "silent", NODE_ENV: "test" } }));

import type { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/http-error.js";
import { errorHandler } from "./error.middleware.js";

const send = (error: unknown) => {
  const json = vi.fn();
  const res = { status: vi.fn().mockReturnThis(), json } as unknown as Response;
  errorHandler(error, { method: "GET", originalUrl: "/x" } as Request, res, vi.fn() as NextFunction);
  return json.mock.calls[0]?.[0];
};

describe("error responses", () => {
  it("shows the message of our own errors, even for a 5xx", () => {
    const body = send(new HttpError(503, "Run the SQL migration first.", "MIGRATION_REQUIRED"));
    expect(body).toMatchObject({ success: false, code: "MIGRATION_REQUIRED", message: "Run the SQL migration first." });
  });

  it("keeps unexpected errors generic", () => {
    const body = send(new Error("connection string is postgres://secret"));
    expect(body.message).toBe("Internal Server Error");
  });
});
