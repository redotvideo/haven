import * as fs from "fs";
import {Request, Response} from "express";

import {config} from "../../lib/config";
import {generateSignedUrl, readFilesInBucket} from "../../gcloud/storage";
import {createComputeAPI, createFromTemplate, list, remove, get, pause} from "../../gcloud/resources";
import {start} from "../../gcloud/resources";
import {createStartupScript, encodeName, getWorkerIP, mapStatus} from "../../lib/misc";
import {InferredStatus, getStatus, getTransport} from "../../lib/client";

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
export async function getModels(_: Request, res: Response) {
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
		const health = ip ? await getStatus(ip) : InferredStatus.OFFLINE;

		return {
			name: name.name,
			status: mapStatus(health, worker?.status),
		};
	});

	const models = await Promise.all(modelPromises);
	res.status(200).send({models});
}

/**
 * Creates a VPS instance for the model to run on.
 */
export async function createWorker(req: Request, res: Response) {
	const {model} = req.params;

	// TODO(konsti): Check if model exists

	const api = await createComputeAPI();

	const workerImageUrl = await generateSignedUrl(BUCKET, `worker/${DOCKER_IMAGE}.tar`);
	const startupScript = await createStartupScript(WORKER_STARTUP_SCRIPT, workerImageUrl);
	const configFile = await fs.promises.readFile(WORKER_CONFIGURATION, {encoding: "utf-8"});
	await createFromTemplate(api, ZONE, configFile, startupScript, encodeName(model));

	res.status(200).send({model});
}

/**
 * Pauses a VPS instance
 */
export async function pauseWorker(req: Request, res: Response) {
	const {model} = req.params;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		res.status(404).send({error: "Worker not found."});
		return;
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await pause(api, ZONE, worker.name);
	res.status(200).send({model});
}

/**
 * Resumes a VPS instance
 */
export async function resumeWorker(req: Request, res: Response) {
	const {model} = req.params;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		res.status(404).send({error: "Worker not found."});
		return;
	}

	if (worker.status !== "TERMINATED") {
		res.status(400).send({error: "Worker is not paused."});
		return;
	}

	await start(api, ZONE, worker.name);
	res.status(200).send({model});
}

/**
 * Deletes the entire VPS instance.
 */
export async function deleteWorker(req: Request, res: Response) {
	const {model} = req.params;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		res.status(404).send({error: "Worker not found."});
		return;
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await remove(api, ZONE, worker.name);
	res.status(200).send({model});
}
