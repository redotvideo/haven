import * as fs from "fs/promises";
import {EventName, sendEvent} from "./telemetry";
import {cloudManager} from "../cloud";
import {Cloud} from "../api/pb/manager_pb";

/*
 * Runs when the manager starts.
 */
export async function setup() {
	sendEvent(EventName.START_MANAGER);

	fs.mkdir("./credentials").catch(() => {});

	// Check if there are already cloud credentials
	const doesGcpKeyExist = await fs
		.access("./credentials/gcp.json")
		.then(() => true)
		.catch(() => false);

	if (doesGcpKeyExist) {
		console.log("[setup] GCP key file already exists. Adding it to the environment.");
		cloudManager.updateCloud(Cloud.GCP, await fs.readFile("./credentials/gcp.json", "utf-8"));
	}

	const doesAwsKeyExist = await fs
		.access("./credentials/aws.txt")
		.then(() => true)
		.catch(() => false);

	if (doesAwsKeyExist) {
		console.log("[setup] AWS key file already exists. Adding it to the environment.");
		cloudManager.updateCloud(Cloud.AWS, await fs.readFile("./credentials/aws.txt", "utf-8"));
	}

	// Create folder for custom models
	await fs.mkdir("./config/models/custom").catch(() => {});
}
