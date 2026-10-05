import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { setupParser } from "./parser";
import { setupResponse } from "./response";

export type ToonFastifyOptions = {};

const toonPlugin: FastifyPluginAsync<ToonFastifyOptions> = async (fastify) => {
  setupParser(fastify);
  setupResponse(fastify);
};

export const toon = fp(toonPlugin, {
  name: "toonkit2",
  fastify: "5.x",
});
