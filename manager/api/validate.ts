import {HandlerContext} from "@bufbuild/connect/dist/types/implementation";

type Check<T> = (i: unknown) => T;
export type Message<T> = Pick<T, {[K in keyof T]: T[K] extends Function ? never : K}[keyof T]>;

/**
 * Takes a typia assert function and a handler function and returns a handler that has
 * validation built in.
 *
 * @param input - Created using typia.createAssertEquals<YourType>()
 * @param handler - Your handler function
 */
export function check<Base, Req extends {[K in keyof Req]: K extends keyof Base ? Req[K] : never}, Res>(
	/**
	 * Base is the generated type from the protobuf file.
	 * Req is the type that you want to validate against. It must extend Base.
	 *
	 * This line makes sure that we can't add any new fields between Base and Req.
	 * Req can only specify fields that are already in Base.
	 *
	 * => Req extends { [K in keyof Req]: K extends keyof Base ? Req[K] : never }
	 *
	 * e.g.: Base = { greeting: string }
	 *       Req  = { greeting: "hello" | "hi" }             // This is a valid extension
	 * 	     Req  = { greeting: "hello" | "hi", foo: "bar" } // This is an invalid extension
	 */

	input: Check<Req>, // typia.createAssertEquals<Req>,
	handler:
		| ((req: Req, ctx: HandlerContext) => Promise<Res>)
		| ((req: Req, ctx: HandlerContext) => Promise<Message<Res>>),
) {
	return async (req: Base, ctx: HandlerContext) => {
		// Validate input.
		await Promise.resolve()
			.then(() => input(req))
			.catch((e) => {
				console.log(e);
				throw e;
			});

		return handler(req as unknown as Req, ctx);
	};
}
