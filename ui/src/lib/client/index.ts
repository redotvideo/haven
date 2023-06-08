import {createPromiseClient, type StreamRequest, type UnaryRequest} from "@bufbuild/connect";
import {Haven} from "./pb/manager_connect";
import {createGrpcWebTransport} from "@bufbuild/connect-web";

const authenticationInterceptor = (next) => async (req: UnaryRequest | StreamRequest) => {
	// TODO(konsti): Implement authentication
	const bearerToken = "Bearer awmzbmspqoadbvkse";
	req.header.set("Authorization", bearerToken);
	return next(req);
};

const transport = createGrpcWebTransport({
	baseUrl: "http://localhost:50052",
	interceptors: [authenticationInterceptor],
});

export const Client = createPromiseClient(Haven, transport);
