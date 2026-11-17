import "dotenv/config";
import chalk from "chalk";

import app from "./app.js";
import { ENV } from "./constants/index.js";

const server = app.listen(ENV.PORT, () => {
  console.log("\n");
  console.log(chalk.bold.cyan("  DADSMITH API"));
  console.log(chalk.gray("  ─────────────────────────────"));
  console.log(chalk.bold("  Status:    "), chalk.green("● Running"));
  console.log(
    chalk.bold("  Server:    "),
    chalk.cyan(`http://localhost:${ENV.PORT}`)
  );
  console.log(
    chalk.bold("  API:       "),
    chalk.cyan(`http://localhost:${ENV.PORT}/api`)
  );
  console.log(chalk.bold("  Mode:      "), chalk.yellow(ENV.NODE_ENV));
  console.log(chalk.gray("  ─────────────────────────────\n"));
});

const shutdown = () => {
  server.close(() => {
    console.log(chalk.green("Server closed."));
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);