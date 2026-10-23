import { randomUUID } from "node:crypto";
import pinoHttp from "pino-http";
import { logger } from "../logger.js";

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const incoming = req.headers["x-request-id"];
    const valid =
      typeof incoming === "string" && /^[\w-]{1,64}$/.test(incoming);
    const id = valid ? incoming : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
