import {ConnectRouter} from "@bufbuild/connect";

import {Haven} from "./pb/manager_connect";
import {Empty, GenerateRequest, GenerateResponse, ListModelsResponse} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, list} from "../gcloud/resources";
import {encodeName, getWorkerIP, mapStatus} from "../lib/misc";
import {getStatus, getTransport} from "../lib/client";
import {readFilesInBucket} from "../gcloud/storage";
import {Status} from "../lib/client/pb/worker_pb";

const DOCKER_IMAGE = config.worker.dockerImage;
const ZONE = config.gcloud.zone;
const BUCKET = config.gcloud.bucket;

const WORKER_CONFIGURATION = config.worker.configFile;
const WORKER_STARTUP_SCRIPT = config.worker.startupScript;

/**
 * Temporary UI endpoint.
 *
 * Eventually, I want to replace this endpoint with two separate ones:
 * - GET /models
 * - GET /workers
 *
 * Maps model folder names to VPS instances and their status.
 */
async function listModels(req: Empty) {
	// Get objects in directory, filter out non-directories
	const files = await readFilesInBucket(BUCKET, "models/");
	const names = files
		.map((file) => (file.name.split("/").length > 0 ? file.name.split("/")[1] : undefined))
		.filter((name, index, self) => self.indexOf(name) === index)
		.filter((name) => name !== "")
		.filter((name) => name !== undefined) as string[];

	// Encode names to base64
	const namesBase64 = names.map((name) => ({name, encoded: encodeName(name)}));

	// Get workers
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);

	// Map workers to models
	const modelPromises = namesBase64.map(async (name) => {
		const worker = workers.find((worker) => worker.name === name.encoded);
		const ip = getWorkerIP(worker);
		const health = ip ? await getStatus(ip) : Status.OFFLINE;

		return {
			name: name.name,
			status: mapStatus(health, worker?.status),
		};
	});

	const models = await Promise.all(modelPromises);
	return new ListModelsResponse({models});
}

/**
 * Generate text from a prompt.
 */
async function* generate(req: GenerateRequest) {
	const model = req.model;
	const prompt = req.prompt;

	// Check if model exists and is running
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	const ip = getWorkerIP(worker);
	if (!ip) {
		return;
	}

	const stream = getTransport(ip).generateStream({prompt});

	for await (const chunk of stream) {
		yield new GenerateResponse({text: chunk.text});
	}
}

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		generate,
		listModels,
	});
