import type { Context } from "hono";
import { jsonToToon } from "../index.js";
import type { ToonDocument } from "../types.js";

declare module "hono" {
  interface Context {
    toon(body: unknown): Response;
  }
}

export function setupResponseHandler(c: Context): void {
  c.toon = (body: unknown) => {
    const payload = typeof body === "string" ? body : jsonToToon(body as ToonDocument);
    return c.text(payload, 200, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  };
}
