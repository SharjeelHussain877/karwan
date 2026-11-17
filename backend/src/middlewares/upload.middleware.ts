import type { Request, Response, NextFunction } from "express";
import multer from "multer";

import { HttpError } from "../utils/http-error.js";

const MAX_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    if (IMAGE_TYPES.includes(file.mimetype)) {
      done(null, true);
    } else {
      done(new HttpError(400, "Upload a JPG, PNG or WebP image (max 2 MB)", "INVALID_IMAGE"));
    }
  }
});

/** Reads an optional image from the `avatar` field of a multipart form into req.file. */
export const optionalAvatar = (req: Request, res: Response, next: NextFunction) => {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      return next(new HttpError(400, "Upload a JPG, PNG or WebP image (max 2 MB)", "INVALID_IMAGE"));
    }
    next(error);
  });
};
