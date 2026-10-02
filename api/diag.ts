import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

export default {
  async fetch(request: Request) {
    const cwd = process.cwd();

    const bundlePath =
      path.join(
        cwd,
        "dist",
        "server.cjs"
      );

    const seedPath =
      path.join(
        cwd,
        "data",
        "streamhub.json"
      );

    const result: Record<string, unknown> = {
      ok: false,
      route: "diag-bundle-12h",
      node: process.version,
      vercel: Boolean(process.env.VERCEL),
      cwd,
      bundlePath,
      bundleExists: fs.existsSync(bundlePath),
      seedExists: fs.existsSync(seedPath)
    };

    if (!fs.existsSync(bundlePath)) {
      const distPath =
        path.join(
          cwd,
          "dist"
        );

      result.distExists =
        fs.existsSync(distPath);

      if (fs.existsSync(distPath)) {
        result.distFiles =
          fs.readdirSync(distPath);
      }

      result.rootFiles =
        fs.readdirSync(cwd)
          .filter(
            (name) =>
              name.includes("server") ||
              name === "dist"
          );

      return Response.json(
        result,
        {
          status: 200
        }
      );
    }

    try {
      const require =
        createRequire(
          import.meta.url
        );

      const loaded =
        require(bundlePath);

      const app =
        loaded && loaded.default
          ? loaded.default
          : loaded;

      result.serverBundleLoaded = true;
      result.moduleType = typeof loaded;
      result.defaultExportType = typeof app;
      result.ok = typeof app === "function";

      return Response.json(
        result,
        {
          status: 200
        }
      );
    }
    catch (error: any) {
      result.serverBundleLoaded = false;
      result.errorName =
        String(
          error?.name ||
          "Error"
        );

      result.errorMessage =
        String(
          error?.message ||
          error
        );

      if (error?.stack) {
        result.errorStack =
          String(error.stack)
            .split("\n")
            .slice(0, 20);
      }

      return Response.json(
        result,
        {
          status: 200
        }
      );
    }
  }
};