import * as fs from "fs";
import {Request, Response} from "express";

import {config} from "../../lib/config";
import {generateSignedUrl, readFilesInBucket} from "../../gcloud/storage";
import {createComputeAPI, createFromTemplate, list, remove, get, pause} from "../../gcloud/resources";
import {start} from "../../gcloud/resources";
import {createStartupScript, encodeName, getWorkerIP, mapStatus} from "../../lib/misc";
import {getTransport} from "../../lib/client";

const DOCKER_IMAGE = config.worker.dockerImage;
const ZONE = config.gcloud.zone;
const BUCKET = config.gcloud.bucket;

const WORKER_CONFIGURATION = config.worker.configFile;
const WORKER_STARTUP_SCRIPT = config.worker.startupScript;

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
