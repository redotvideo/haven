import {fastify, FastifyInstance} from "fastify";
import cors from "@fastify/cors";
import {fastifyConnectPlugin} from "@bufbuild/connect-fastify";
import {haven} from "./api";

async function createServer(server: any, port: number) {
	// TODO(konsti): Finer cors configuration
	server.register(cors);
	await server.register(fastifyConnectPlugin, {routes: haven});
	await server.listen({host: "localhost", port: port});

	console.log("Server is listening at", server.addresses());
	return server;
}

/**
 * Creates and starts the fastify server hosting the GRCP API.
 *
 * One server is created for HTTP/2 and one for HTTP/1.1 (web grpc)
 */
export async function runServer() {
	const http2 = await createServer(fastify({http2: true}), 50051);
	const http1 = await createServer(fastify(), 50052);

	return async () => {
		await http2.close();
		await http1.close();
	};
}
