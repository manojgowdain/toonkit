import compression from "compression";
import type { CompressionOptions } from "compression";
import bodyParser from "body-parser";
import type { OptionsText } from "body-parser";
import type { RequestHandler } from "express-serve-static-core";
import { toonToJson } from "../index.js";

export type ToonExpressParserOptions = {
  compression?: boolean | CompressionOptions;
  text?: boolean | OptionsText;
};

const defaultTextTypes = [
  "text/plain",
  "text/*",
  "application/json",
  "application/toon",
  "application/vnd.toon",
  "application/x-toon"
];

export function createCompressionMiddleware(
  options: ToonExpressParserOptions["compression"]
): RequestHandler | null {
  if (options === false) {
    return null;
  }

  return compression(typeof options === "object" ? options : undefined);
}

export function createTextMiddleware(
  options: ToonExpressParserOptions["text"]
): RequestHandler | null {
  if (options === false) {
    return null;
  }

  const textOptions = options && typeof options === "object" ? options : undefined;

  return bodyParser.text({
    type: defaultTextTypes,
    ...textOptions
  });
}

export function createRequestMiddleware(): RequestHandler {
  return (req, _res, next) => {
    // Normalize req.body: if it's a string, try to parse it
    if (typeof req.body === "string") {
      // First try to parse as JSON if it looks like JSON
      if (req.body.trim().startsWith("{") || req.body.trim().startsWith("[")) {
        try {
          req.body = JSON.parse(req.body);
        } catch {
          // If JSON parsing fails, try TOON format
          req.body = toonToJson(req.body);
        }
      } else {
        // Otherwise treat as TOON format
        req.body = toonToJson(req.body);
      }
    }
    
    // Provide convenience method to parse TOON
    req.toon = () => {
      if (typeof req.body === "string") {
        return toonToJson(req.body);
      }
      return req.body;
    };
    next();
  };
}
