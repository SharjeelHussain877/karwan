import { Router } from "express";

import { optionalAvatar } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./controller.js";
import { updateUserSchema } from "./schema.js";

/**
 * One resource, three routes. What a request may do depends on the signed-in user's
 * role and on whose :id it is (see service.ts).
 *
 *   GET   /user        everyone else (dev / super_admin only)
 *   GET   /user/:id    one user (your own, or someone else's for dev / super_admin)
 *   PATCH /user/:id    update one user (your own profile, or anyone's as super_admin)
 */
const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id", optionalAvatar, validate(updateUserSchema), controller.update);

export default router;
