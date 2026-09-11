import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { jsonToToon, toonToJson } from "../index.js";
import type { ToonDocument } from "../types.js";

declare global {
  var toonAxios: AxiosInstance | undefined;
}

export interface ToonFetchOptions
  extends Omit<AxiosRequestConfig, "data" | "transformResponse"> {
  /**
   * The payload to send. If `Content-Type` is `application/toon` (default when data is provided),
   * this will automatically be serialized to TOON format.
   */
  data?: unknown;
  /**
   * Raw body string/buffer, overrides `data` if provided.
   */
  body?: BodyInit | null;
  /**
   * Optional bearer token convenience helper.
   */
  token?: string | null | (() => string | null | undefined);
}

export interface ToonFetchResponse<T = unknown> {
  data: T | null;
  response: Response;
}

export interface ToonClientOptions extends ToonFetchOptions {
  baseURL?: string;
}

function resolveToken(
  token?: ToonClientOptions["token"]
): string | undefined {
  if (token === undefined) {
    return undefined;
  }

  const value = typeof token === "function" ? token() : token;
  if (!value) {
    return undefined;
  }

  return value.startsWith("Bearer ") ? value : `Bearer ${value}`;
}

function headersToObject(
  headers?: HeadersInit | Headers | ToonFetchOptions["headers"]
): Record<string, string> {
  return Object.fromEntries(
    new Headers(headers as HeadersInit | undefined).entries()
  ) as Record<string, string>;
}

function createResponseLike(
  response: AxiosResponse<string>,
  bodyText: string
): Response {
  const headers = new Headers(response.headers as HeadersInit);

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    headers,
    text: async () => bodyText,
    json: async () => (bodyText ? JSON.parse(bodyText) : null),
    clone: () => createResponseLike(response, bodyText),
  } as Response;
}

export const toonAxios = globalThis.toonAxios ?? axios.create();

if (!globalThis.toonAxios) {
  globalThis.toonAxios = toonAxios;
}

export function configureToonFetch(options: ToonClientOptions = {}): AxiosInstance {
  const { token, headers, baseURL, ...rest } = options;

  if (baseURL !== undefined) {
    toonAxios.defaults.baseURL = baseURL;
  }

  Object.assign(toonAxios.defaults, rest);

  if (headers) {
    const defaults = toonAxios.defaults.headers as Record<string, unknown>;
    defaults.common = {
      ...(defaults.common || {}),
      ...headersToObject(headers),
    };
  }

  const authorization = resolveToken(token);
  if (authorization !== undefined) {
    toonAxios.defaults.headers.common = {
      ...toonAxios.defaults.headers.common,
      Authorization: authorization
    };
  }

  return toonAxios;
}

export function createToonAxios(options: ToonClientOptions = {}): AxiosInstance {
  const client = axios.create();
  const { token, headers, baseURL, ...rest } = options;

  if (baseURL !== undefined) {
    client.defaults.baseURL = baseURL;
  }

  Object.assign(client.defaults, rest);

  if (headers) {
    const defaults = client.defaults.headers;
    defaults.common = {
      ...(defaults.common || {}),
      ...headersToObject(headers),
    };
  }

  const authorization = resolveToken(token);
  if (authorization !== undefined) {
    client.defaults.headers.common.Authorization = authorization;
  }

  return client;
}

function resolveRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

async function resolveRequestBody(
  input: RequestInfo | URL,
  init?: ToonFetchOptions
): Promise<{ body?: BodyInit | null; headers: Headers }> {
  const headers = new Headers(init?.headers as HeadersInit | undefined);

  if (init?.data !== undefined && init.body == null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/toon");
    }

    const contentType = headers.get("Content-Type");
    if (contentType?.includes("application/toon")) {
      return { body: jsonToToon(init.data as ToonDocument), headers };
    }

    if (contentType?.includes("application/json")) {
      return { body: JSON.stringify(init.data), headers };
    }

    return { body: init.data as BodyInit, headers };
  }

  if (
    typeof Request !== "undefined" &&
    input instanceof Request &&
    input.body !== null &&
    init?.body == null &&
    init?.data === undefined
  ) {
    const cloned = input.clone();
    const bodyText = await cloned.text();

    input.headers.forEach((value, key) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });

    return { body: bodyText, headers };
  }

  return { body: init?.body, headers };
}

/**
 * A wrapper around the native `fetch` API that automatically handles
 * `application/toon` content types for both request and response.
 */
export async function toonFetch<T = unknown>(
  input: RequestInfo | URL,
  init?: ToonFetchOptions
): Promise<ToonFetchResponse<T>> {
  const { body, headers } = await resolveRequestBody(input, init);

  const response = await toonAxios.request<string>({
    ...init,
    url: resolveRequestUrl(input),
    method:
      init?.method ||
      (typeof input !== "string" && !(input instanceof URL) ? input.method : undefined),
    headers: headersToObject(headers),
    data: body,
    responseType: "text",
    transformResponse: [(value) => value],
    validateStatus: () => true,
  });

  const rawBody = typeof response.data === "string" ? response.data : String(response.data ?? "");
  let parsedData: T | null = null;
  const responseHeaders = response.headers;
  const rawContentType = typeof responseHeaders?.get === "function"
    ? responseHeaders.get("content-type")
    : responseHeaders?.["content-type"];
  const contentType = Array.isArray(rawContentType) ? rawContentType.join(" ") : String(rawContentType ?? "");

  // Only attempt to parse if there's a body and it's not a 204 No Content
  if (response.status !== 204) {
    if (contentType?.includes("application/toon")) {
      parsedData = rawBody ? (toonToJson(rawBody) as unknown as T) : null;
    } else if (contentType?.includes("application/json")) {
      parsedData = rawBody ? JSON.parse(rawBody) : null;
    }
  }

  return { data: parsedData, response: createResponseLike(response, rawBody) };
}
