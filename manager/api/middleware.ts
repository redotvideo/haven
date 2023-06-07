import {Code, ConnectError, HandlerContext} from "@bufbuild/connect";
import {StatusResponse} from "./pb/manager_pb";

export function secure<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		// TODO(konsti): we're just hardcoding the token here for now
		if (context.requestHeader.get("authorization") !== "Bearer awmzbmspqoadbvkse") {
			throw new ConnectError("Unauthorized", Code.Unauthenticated);
		}

		return func(req, context);
	};
}
