import {createPromiseClient, type StreamRequest, type UnaryRequest} from "@bufbuild/connect";
import {Haven} from "./pb/manager_connect";
import {createGrpcWebTransport} from "@bufbuild/connect-web";

export const authenticationInterceptor = (next) => async (req: UnaryRequest | StreamRequest) => {
	// TODO(konsti): Implement authentication
	const bearerToken = "Bearer awmzbmspqoadbvkse";
	req.header.set("Authorization", bearerToken);
	return next(req);
};

export function getAddress(hostname: string) {
	return `http://${hostname}:50052`;
}

const address = getAddress("{{MANAGER_IP}}");

export const isInitialized = address !== "http://{{MANAGER_IP}}:50052";

const transport = createGrpcWebTransport({
	// Refer to /manager/lib/setup.ts
	baseUrl: address,
	interceptors: [authenticationInterceptor],
});

export const Client = createPromiseClient(Haven, transport);
