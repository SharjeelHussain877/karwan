import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";

import routes from "./routes/index.js";
import docsRoutes from "./routes/docs.route.js";
import { corsOptions } from "./config/cors.js";
import { globalLimiter } from "./middlewares/rate-limit.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { renderStatusPage } from "./views/root.js";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).type("html").send(renderStatusPage());
});

app.use("/api/docs", docsRoutes);

app.use("/api", globalLimiter);
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;