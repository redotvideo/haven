import {Code, ConnectError, HandlerContext} from "@bufbuild/connect";
import {config} from "../lib/config";
import {EventName, sendEvent} from "../lib/telemetry";

/**
 * Check if the request is authenticated and throw an error if not.
 */
export function auth<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		if (context.requestHeader.get("authorization") !== `Bearer ${config.server.bearerToken}`) {
			throw new ConnectError("Unauthorized", Code.Unauthenticated);
		}

		return func(req, context);
	};
}

/**
 * Catch errors and throw a ConnectError instead.
 */
export function catchErrors<T, U>(func: (req: T, context: HandlerContext) => Promise<U>) {
	return async (req: T, context: HandlerContext): Promise<U> => {
		try {
			const res = await func(req, context);
			return res;
		} catch (err) {
			console.error(err);
			if (err instanceof ConnectError) {
				sendEvent(EventName.ERROR, {code: err.code});
				throw err;
			} else {
				sendEvent(EventName.ERROR, {code: Code.Unknown});
				throw new ConnectError(err.message, Code.Unknown);
			}
		}
	};
}

/**
 * Checks if the setup is complete and throws an error if not.
 */
export function enforceSetup<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		if (!config.setupDone) {
			throw new ConnectError(
				"Setup not complete. Please add your Google Cloud service account first. You can find instructions for this on https://docs.haven.run.",
				Code.FailedPrecondition,
			);
		}

		return func(req, context);
	};
}

/**
 * Check that admin endpoints are enabled and throw an error if not.
 */
export function admin<T, U>(func: (req: T, context: HandlerContext) => U) {
	return (req: T, context: HandlerContext): U => {
		if (config.server.disableAdmin) {
			throw new ConnectError("Admin endpoints not enabled for this manager", Code.PermissionDenied);
		}

		return func(req, context);
	};
}
