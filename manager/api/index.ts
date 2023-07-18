import {fastify} from "fastify";
import cors from "@fastify/cors";
import {fastifyConnectPlugin} from "@bufbuild/connect-fastify";
import {haven} from "./api";
import {v4 as uuidv4} from "uuid";

async function createApiServer(server: any, port: number) {
	server.register(cors);
	await server.register(fastifyConnectPlugin, {routes: haven});
	await server.listen({host: "0.0.0.0", port: port});

	console.log("Server is listening at", server.addresses());
	return server;
}

/**
 * Creates and starts the fastify server hosting the GRCP API.
 *
 * Servers are created for:
 * - HTTP/2: grpc
 * - HTTP/1.1: grpc-web
 */
export async function runServer() {
	const settings = {
		logger: {
			transport: {
				target: "pino-pretty",
			},
		},

		// Give each request a unique ID
		genReqId(req: any) {
			return uuidv4();
		},
	};

	const http1 = await createApiServer(fastify({...settings}), 50052);
	const http2 = await createApiServer(fastify({...settings, http2: true}), 50051);

	return async () => {
		await http1.close();
		await http2.close();
	};
}
