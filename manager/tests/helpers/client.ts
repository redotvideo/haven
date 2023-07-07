import {createPromiseClient, type StreamRequest, type UnaryRequest} from "@bufbuild/connect";
import {createGrpcTransport} from "@bufbuild/connect-node";
import {Haven} from "../../api/pb/manager_connect";

export function createClient(bearer: string) {
	const authenticationInterceptor = (next: any) => async (req: UnaryRequest | StreamRequest) => {
		const bearerToken = `Bearer ${bearer}`;
		req.header.set("Authorization", bearerToken);
		return next(req);
	};

	const transport = createGrpcTransport({
		baseUrl: "http://localhost:50051",
		interceptors: [authenticationInterceptor],
		httpVersion: "2",
	});

	return createPromiseClient(Haven, transport);
}
