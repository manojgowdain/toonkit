import type { Context } from "hono";
import { toonToJson } from "../index.js";

declare module "hono" {
  interface HonoRequest {
    toon(): Promise<unknown>;
  }
}

export function setupRequestParser(c: Context): void {
  c.req.toon = async () => {
    const body = await c.req.text();
    if (!body) return undefined;

    if (body.trim().startsWith("{") || body.trim().startsWith("[")) {
      try {
        return JSON.parse(body);
      } catch {
        return toonToJson(body);
      }
    }
    return toonToJson(body);
  };
}
