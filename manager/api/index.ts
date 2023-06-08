import {fastify} from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import {fastifyConnectPlugin} from "@bufbuild/connect-fastify";
import {haven} from "./api";
import {config} from "../lib/config";

async function createFileServer(server: any, port: number) {
	const dir = `${__dirname}/../../ui`;
	server.register(fastifyStatic, {
		root: dir,
		prefix: "/",
		index: "index.html",
	});

	server.setNotFoundHandler((request: any, reply: any) => {
		reply.sendFile("index.html");
	});

	await server.listen({host: "0.0.0.0", port: port});

	console.log("Fileserver is listening at", server.addresses());
	return server;
}

async function createApiServer(server: any, port: number) {
	// TODO(konsti): Finer cors configuration
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
 * - HTTP/1.1: static files (optional, for serving the UI)
 */
export async function runServer() {
	const http1 = await createApiServer(fastify(), 50052);
	const http2 = await createApiServer(fastify({http2: true}), 50051);

	let fileServer: any = null;
	if (config.server.runFileServer) {
		fileServer = await createFileServer(fastify(), 80);
	}

	return async () => {
		await http1.close();
		await http2.close();
		await fileServer?.close();
	};
}
