import * as fs from "fs/promises";
import {readFilesInBucket, uploadFileToBucket} from "../gcloud/storage";
import {config} from "./config";

const WORKER_IMAGE = config.worker.dockerImage;
const BUCKET = config.gcloud.bucket;

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
		// TODO(konsti): upload through API endpoint
		throw new Error("Please provide your google cloud key inside the key.json file.");
	} else {
		console.log("Google cloud key file found.");
	}

	process.env.GOOGLE_APPLICATION_CREDENTIALS = "./key.json";

	// Check for worker docker image
	const files = await readFilesInBucket("konsti-test-bucket", "worker/");
	const dockerImage = files.find((file) => file.name === `worker/${WORKER_IMAGE}.tar`);
	const exists = dockerImage !== undefined;

	if (!exists) {
		console.log(`Docker image ${WORKER_IMAGE} does not exist. Uploading...`);
		await uploadFileToBucket(BUCKET, `./worker/${WORKER_IMAGE}.tar`, `worker/${WORKER_IMAGE}.tar`);
	} else {
		console.log(`Docker image ${WORKER_IMAGE} already exists.`);
	}

	console.log("Setup done.");
}
