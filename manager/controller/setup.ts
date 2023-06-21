import * as fs from "fs/promises";

import {Code, ConnectError} from "@bufbuild/connect";
import {setup} from "../lib/setup";

export async function setupController(file: string) {
	// Now we can assume that the key file is being uploaded
	const isValidJson = await Promise.resolve()
		.then(() => JSON.parse(file))
		.then(() => true)
		.catch(() => false);

	// TODO(konsti): Check that the key actually works by making some test request
	if (!isValidJson) {
		throw new ConnectError("Invalid key file", Code.InvalidArgument);
	}

	await fs.writeFile("./key.json", file);

	await setup().catch((err) => {
		throw new ConnectError(err.message, Code.Internal);
	});
}
