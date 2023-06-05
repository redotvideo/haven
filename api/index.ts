import {fastify} from "fastify";
import cors from "@fastify/cors";
import {fastifyConnectPlugin} from "@bufbuild/connect-fastify";
import {haven} from "./predict";

/**
 * Creates and starts the fastify server hosting the GRCP API.
 */
export async function runServer() {
	const port = 50051;
	const server = fastify();

	// TODO(konsti): Finer cors configuration
	server.register(cors);

	await server.register(fastifyConnectPlugin, {routes: haven});
	await server.listen({host: "localhost", port});

	console.log("server is listening at", server.addresses());
}
