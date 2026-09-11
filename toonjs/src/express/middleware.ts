import type { RequestHandler } from "express-serve-static-core";

import { createCompressionMiddleware, createTextMiddleware, createRequestMiddleware, type ToonExpressParserOptions } from "./parser.js";
import { createResponseMiddleware } from "./response.js";

declare module "express-serve-static-core" {
  interface Request {
    toon(): unknown;
  }
}

export type ToonExpressOptions = ToonExpressParserOptions;

export function toon(options: ToonExpressOptions = {}): RequestHandler[] {
  const middlewares: RequestHandler[] = [];

  const compressionMiddleware = createCompressionMiddleware(options.compression);
  if (compressionMiddleware) {
    middlewares.push(compressionMiddleware);
  }

  const textMiddleware = createTextMiddleware(options.text);
  if (textMiddleware) {
    middlewares.push(textMiddleware);
  }

  middlewares.push(createRequestMiddleware());
  middlewares.push(createResponseMiddleware());

  return middlewares;
}
