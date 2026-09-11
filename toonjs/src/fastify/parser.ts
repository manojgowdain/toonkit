import type { FastifyInstance } from "fastify";
import { toonToJson } from "../index.js";

declare module "fastify" {
  interface FastifyRequest {
    toon(): unknown;
  }
}

export function setupParser(fastify: FastifyInstance): void {
  fastify.decorateRequest("toon", function () {
    if (typeof this.body === "string") {
      return toonToJson(this.body);
    }
    return this.body;
  });

  const defaultTextTypes = [
    "text/plain",
    "application/toon",
    "application/vnd.toon",
    "application/x-toon",
  ];

  fastify.addContentTypeParser(
    defaultTextTypes,
    { parseAs: "string" },
    function (_req, body, done) {
      try {
        if (typeof body === "string") {
          let parsed;
          if (body.trim().startsWith("{") || body.trim().startsWith("[")) {
            try {
              parsed = JSON.parse(body);
            } catch {
              parsed = toonToJson(body);
            }
          } else {
            parsed = toonToJson(body);
          }
          done(null, parsed);
        } else {
          done(null, body);
        }
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );
}
