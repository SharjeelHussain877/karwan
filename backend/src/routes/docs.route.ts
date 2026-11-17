import { Router } from "express";
import { apiReference } from "@scalar/express-api-reference";

import { openApiDocument } from "../docs/openapi.js";

const router = Router();

const docsCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "connect-src 'self' https://cdn.jsdelivr.net"
].join("; ");

router.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", docsCsp);
  next();
});

router.get(
  "/",
  apiReference({
    content: openApiDocument,
    theme: "alternate",
    pageTitle: "Dadsmith API Reference",
    defaultHttpClient: { targetKey: "js", clientKey: "axios" },
    hiddenClients: true,
    hideTestRequestButton: true,
    hideDarkModeToggle: true
  })
);

export default router;
