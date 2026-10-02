import fs from "node:fs";
import path from "node:path";

export default {
  async fetch(request: Request) {
    const cwd = process.cwd();

    const seedFile =
      path.join(
        cwd,
        "data",
        "streamhub.json"
      );

    const tmpDir =
      path.join(
        "/tmp",
        "data"
      );

    const info: Record<string, unknown> = {
      ok: false,
      route: "diag",
      node: process.version,
      vercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV || null,
      cwd,
      seedFile,
      seedExists: fs.existsSync(seedFile),
      tmpExists: fs.existsSync("/tmp")
    };

    try {
      fs.mkdirSync(
        tmpDir,
        {
          recursive: true
        }
      );

      info.tmpWritable = true;
    }
    catch (error: any) {
      info.tmpWritable = false;
      info.tmpError = String(
        error?.message ||
        error
      );
    }

    try {
      const serverModule =
        await import("../server");

      info.ok = true;
      info.serverImport = "OK";
      info.defaultExportType =
        typeof serverModule.default;

      return Response.json(
        info,
        {
          status: 200
        }
      );
    }
    catch (error: any) {
      info.serverImport =
        "FAILED";

      info.errorName =
        String(
          error?.name ||
          "Error"
        );

      info.errorMessage =
        String(
          error?.message ||
          error
        );

      if (error?.stack) {
        info.errorStack =
          String(error.stack)
            .split("\n")
            .slice(0, 20);
      }

      return Response.json(
        info,
        {
          status: 200
        }
      );
    }
  }
};