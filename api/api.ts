import * as fs from "fs";

import {ConnectRouter, HandlerContext} from "@bufbuild/connect";

import {Haven} from "./pb/manager_connect";
import {
	Empty,
	GenerateRequest,
	GenerateResponse,
	ListModelsResponse,
	ModelName,
	RequestStatus,
	StatusResponse,
} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, createFromTemplate, list, pause, remove, start} from "../gcloud/resources";
import {createStartupScript, encodeName, getWorkerIP, mapStatus} from "../lib/misc";
import {getStatus, getTransport} from "../lib/client";
import {generateSignedUrl, readFilesInBucket} from "../gcloud/storage";
import {Status} from "../lib/client/pb/worker_pb";
import {secure} from "./middleware";

const DOCKER_IMAGE = config.worker.dockerImage;
const ZONE = config.gcloud.zone;
const BUCKET = config.gcloud.bucket;

const WORKER_CONFIGURATION = config.worker.configFile;
const WORKER_STARTUP_SCRIPT = config.worker.startupScript;

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
		// TODO(konsti): the end token should not be sent to the manager in the first place
		yield new GenerateResponse({text: chunk.text.replace("<|im_end|>", "")});
	}
}

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

async function createWorker(req: ModelName) {
	const model = req.name;

	// TODO(konsti): Check if model exists

	const api = await createComputeAPI();

	const workerImageUrl = await generateSignedUrl(BUCKET, `worker/${DOCKER_IMAGE}.tar`);
	const configFileUrl = await generateSignedUrl(BUCKET, `models/${model}/config.json`);

	const startupScript = await createStartupScript(WORKER_STARTUP_SCRIPT, workerImageUrl, configFileUrl);
	const configFile = await fs.promises.readFile(WORKER_CONFIGURATION, {encoding: "utf-8"});
	await createFromTemplate(api, ZONE, configFile, startupScript, encodeName(model));

	return new StatusResponse({status: RequestStatus.OK});
}

async function pauseWorker(req: ModelName) {
	const model = req.name;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		return new StatusResponse({
			status: RequestStatus.BAD_REQUEST,
			message: `Worker ${model} does not exist`,
		});
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await pause(api, ZONE, worker.name);
	return new StatusResponse({status: RequestStatus.OK});
}

async function resumeWorker(req: ModelName, context: HandlerContext) {
	const model = req.name;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		return new StatusResponse({
			status: RequestStatus.BAD_REQUEST,
			message: `Worker ${model} does not exist`,
		});
	}

	if (worker.status !== "TERMINATED") {
		return new StatusResponse({
			status: RequestStatus.BAD_REQUEST,
			message: `Worker ${model} is not paused`,
		});
	}

	await start(api, ZONE, worker.name);
	return new StatusResponse({status: RequestStatus.OK});
}

async function deleteWorker(req: ModelName) {
	const model = req.name;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	if (!worker || !worker.name) {
		return new StatusResponse({
			status: RequestStatus.BAD_REQUEST,
			message: `Worker ${model} does not exist`,
		});
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await remove(api, ZONE, worker.name);
	return new StatusResponse({status: RequestStatus.OK});
}

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		generate: secure(generate),
		listModels: secure(listModels),

		createWorker: secure(createWorker),
		pauseWorker: secure(pauseWorker),
		resumeWorker: secure(resumeWorker),
		deleteWorker: secure(deleteWorker),
	});
