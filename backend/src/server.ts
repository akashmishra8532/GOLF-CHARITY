import { app } from "./app";
import { env } from "./config/env";

async function main() {
  const { httpPort } = env;
  app.listen(httpPort, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${httpPort}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

