import pino from "pino";
import { ENV } from "../constants/index.js";

const logger = pino({
  level: ENV.LOG_LEVEL,

  ...(ENV.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;