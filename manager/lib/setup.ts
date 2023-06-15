import * as fs from "fs/promises";
import {readFilesInBucket, uploadFileToBucket} from "../gcloud/storage";
import {config} from "./config";

const WORKER_IMAGE = config.worker.dockerImage;
const BUCKET = config.gcloud.bucket;

/**
 * Currently unused as we're not developing the UI anymore.
 *
 * This function sets up the UI by hardcoding the public address of the manager
 * into the compiled UI files.
 *
 * TODO(konsti): Can only be called once. Maybe we can add the option to change
 * the IP address later somehow.
 */
export async function setupUI(address: string) {
	const filesToBeUpdated = await fs.readdir("./ui/assets");
	const files = await Promise.all(
		filesToBeUpdated.map(async (file) => {
			if (!file.endsWith(".js")) {
				return;
			}

			const content = await fs.readFile(`./ui/assets/${file}`, "utf-8");
			const newContent = content.replace("{{MANAGER_IP}}", address);

			// Replace the old file with the new one
			await fs.writeFile(`./ui/assets/${file}`, newContent);
		}),
	);

	console.log(`Scanned and updated ${files.length} UI files.`);
}

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
	config.gcloud.projectId = JSON.parse(await fs.readFile("./key.json", "utf-8")).project_id;

	console.log(`Project ID: ${config.gcloud.projectId}`);

	// Check for worker docker image
	const files = await readFilesInBucket(config.gcloud.bucket, "worker/");
	const dockerImage = files.find((file) => file.name === `worker/${WORKER_IMAGE}.tar`);
	const exists = dockerImage !== undefined;

	if (!exists) {
		console.log(`Docker image ${WORKER_IMAGE} does not exist. Uploading...`);
		await uploadFileToBucket(BUCKET, `./worker/${WORKER_IMAGE}.tar`, `worker/${WORKER_IMAGE}.tar`);
	} else {
		console.log(`Docker image ${WORKER_IMAGE} already exists.`);
	}

	console.log("Setup done.");
	config.setupDone = true;
}
