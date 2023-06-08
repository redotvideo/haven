import {Code} from "@bufbuild/connect";
import {path} from "./navigation";
import {Client} from "./client";
import * as router from "svelte-routing";

/**
 * Checks if the manager is already set up and redirects to the setup page if not.
 */
export async function checkSetup() {
	const isSetup = await Client.setup({})
		.then(() => true)
		.catch((err) => {
			if (err.code === Code.FailedPrecondition) {
				return false;
			}

			throw err;
		});

	if (!isSetup) {
		router.navigate("/setup");
		path.set("/setup");
	}
}
