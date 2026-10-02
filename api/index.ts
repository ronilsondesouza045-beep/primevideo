import path from "node:path";
import { createRequire } from "node:module";

const require =
  createRequire(
    import.meta.url
  );

const bundlePath =
  path.join(
    process.cwd(),
    "dist",
    "server.cjs"
  );

const loaded =
  require(
    bundlePath
  );

const app =
  loaded &&
  loaded.default
    ? loaded.default
    : loaded;

if (typeof app !== "function") {
  throw new Error(
    "PrimeVideo Express bundle nao exportou uma funcao."
  );
}

export default app;