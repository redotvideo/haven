import * as fs from "fs/promises";
import {config} from "./config";
import {EventName, healthCheck, sendEvent} from "./telemetry";

/*
 * Runs when the manager starts. Checks that the setup has already been done.
 */
export async function setup() {
	// Check for key.json
	const doesKeyExist = await fs
		.access("./key.json")
		.then(() => true)
		.catch(() => false);

	if (!doesKeyExist) {
		console.log("Google cloud key file not found. Pausing setup and waiting for file to get uploaded.");
		return;
	} else {
		console.log("Google cloud key file found.");
	}

	process.env.GOOGLE_APPLICATION_CREDENTIALS = "./key.json";

	const key = JSON.parse(await fs.readFile("./key.json", "utf-8"));
	config.gcloud.projectId = key.project_id;
	config.gcloud.serviceAccount = key.client_email;
	config.gcloud.clientId = key.client_id;

	console.log(`Project ID: ${config.gcloud.projectId}`);

	// Check for disable telemetry flag
	const useTelemetry = process.env.DISABLE_TELEMETRY !== "true";
	config.telemetry = useTelemetry;

	sendEvent(EventName.START_MANAGER);

	console.log("Setup done.");
	config.setupDone = true;

	await healthCheck().catch(() => {});
}
