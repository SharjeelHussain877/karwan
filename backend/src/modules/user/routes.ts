import { Router } from "express";

import { optionalAvatar } from "../../middlewares/upload.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import * as controller from "./controller.js";
import { updateUserSchema } from "./schema.js";

const router = Router();

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id", optionalAvatar, validate(updateUserSchema), controller.update);

export default router;
