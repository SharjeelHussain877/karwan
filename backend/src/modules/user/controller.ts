import type { Request, Response } from "express";

import { HttpError } from "../../utils/http-error.js";
import { getAccessToken } from "../auth/cookies.js";
import { listQuerySchema, userIdSchema } from "./schema.js";
import * as service from "./service.js";

const readId = (req: Request): string => {
  const parsed = userIdSchema.safeParse(req.params.id);
  if (!parsed.success) throw new HttpError(400, "Invalid user id", "VALIDATION_ERROR");
  return parsed.data;
};

/** GET /user */
export const list = async (req: Request, res: Response) => {
  const query = listQuerySchema.safeParse(req.query);
  if (!query.success) throw new HttpError(400, "offset and limit must be numbers", "VALIDATION_ERROR");

  const page = await service.listUsers(getAccessToken(req), query.data.offset, query.data.limit);
  res.json({ success: true, data: page });
};

/** GET /user/:id */
export const getOne = async (req: Request, res: Response) => {
  const user = await service.getUser(getAccessToken(req), readId(req));
  res.json({ success: true, data: { user } });
};

/** PATCH /user/:id (JSON, or multipart when there is an avatar) */
export const update = async (req: Request, res: Response) => {
  const file = req.file;
  const changes: service.UserChanges = {
    ...req.body,
    ...(file ? { avatar: { buffer: file.buffer, contentType: file.mimetype } } : {})
  };

  if (Object.values(changes).every((value) => value === undefined)) {
    throw new HttpError(400, "Nothing to update", "VALIDATION_ERROR");
  }

  const user = await service.updateUser(getAccessToken(req), readId(req), changes);
  res.json({ success: true, data: { user } });
};
