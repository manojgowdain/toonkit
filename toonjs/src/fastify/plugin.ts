import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { setupParser } from "./parser.js";
import { setupResponse } from "./response.js";

export type ToonFastifyOptions = {};

const toonPlugin: FastifyPluginAsync<ToonFastifyOptions> = async (fastify) => {
  setupParser(fastify);
  setupResponse(fastify);
};

export const toon = fp(toonPlugin, {
  name: "toonkit",
  fastify: "5.x",
});
