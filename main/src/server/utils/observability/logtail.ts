import {Logtail} from "@logtail/node";
import {getServerSession} from "next-auth";
import {authOptions} from "../../auth";

export const logtail = new Logtail(process.env.LOGTAIL_KEY || "");

// Don't send logs to Logtail in development
function ifProd(fn: () => void) {
	if (process.env.LOGTAIL_ENV === "production") {
		fn();
	}
}

interface Data {
	userId?: string;
	[key: string]: any;
}

function createLogger(level: (typeof levels)[number]) {
	return (message: string, data: Data = {}) => {
		void getServerSession(authOptions).then((session) => {
			const payload = {
				...data,
				userId: data.userId ? data.userId : session?.user?.id,
			};

			console[level](message, payload);
			ifProd(() => void logtail[level](message, payload));
		});
	};
}

const levels: ["error", "warn", "info", "debug"] = ["error", "warn", "info", "debug"];

export const logger = {
	error: createLogger("error"),
	warn: createLogger("warn"),
	info: createLogger("info"),
	debug: createLogger("debug"),
};
