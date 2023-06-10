import {Code, ConnectError, HandlerContext} from "@bufbuild/connect";
import {config} from "../lib/config";

/**
 * This middleware is used for both authentication and catch-all error handling.
 */
export function secure<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		// TODO(konsti): we're just hardcoding the token here for now
		if (context.requestHeader.get("authorization") !== "Bearer awmzbmspqoadbvkse") {
			throw new ConnectError("Unauthorized", Code.Unauthenticated);
		}

		try {
			return func(req, context);
		} catch (err) {
			console.error(err);
			throw new ConnectError(err.message, Code.Internal);
		}
	};
}

/**
 * Checks if the setup is complete and throws an error if not.
 */
export function enforceSetup<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		if (!config.setupDone) {
			throw new ConnectError("Setup not complete", Code.FailedPrecondition);
		}

		return func(req, context);
	};
}
