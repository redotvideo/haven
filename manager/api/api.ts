import * as fs from "fs";

import {ConnectError, Code, ConnectRouter} from "@bufbuild/connect";

import {Haven} from "./pb/manager_connect";
import {
	CreateInferenceWorkerRequest,
	Empty,
	GenerateRequest,
	GenerateResponse,
	InferenceWorker,
	ListModelsResponse,
	SetupRequest,
} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, list, pause, remove, start} from "../gcloud/resources";
import {encodeName, getWorkerIP} from "../lib/misc";
import {getTransport} from "../lib/client";
import {catchErrors, enforceSetup, auth} from "./middleware";
import {getAllModels} from "../lib/models";
import {setupController} from "../controller/setup";
import {generateController} from "../controller/generate";
import {createInferenceWorkerController} from "../controller/createInferenceWorker";
import { sendEvent } from "../lib/telemetry";

const ZONE = config.gcloud.zone;

/**
 * Set up the manager by providing the Google Cloud key.
 */
async function setupHandler(req: SetupRequest) {
	if (config.setupDone) {
		// Endpoint is being called as "ping" to check if the setup is done.
		// It is, so we return.
		return;
	}

	const file = req.keyFile;

	if (file === undefined) {
		// Endpoint is being called as "ping" to check if the setup is done.
		// It's not, so we throw an error.
		throw new ConnectError("Setup not complete.", Code.FailedPrecondition);
	}

	// Now we can assume that the setup is not done and the user wants to finish it.
	return setupController(file);
}

/**
 * Generate text from a prompt.
 */
async function* generate(req: GenerateRequest) {
	const workerName = req.workerName;
	const prompt = req.prompt;

	const {maxTokens, temperature, topP, topK, sample} = req;

	const stream = await generateController(workerName, prompt, {maxTokens, temperature, topP, topK, sample});

	for await (const data of stream) {
		yield new GenerateResponse({text: data.text});
	}
}

/**
 * Get all models that are available for inference.
 */
async function listModels(req: Empty) {
	return getAllModels()
		.then((names) => names.map((name) => ({name})))
		.then((models) => new ListModelsResponse({models}))
		.catch((e) => {
			throw new ConnectError(e.message, Code.Internal);
		});
}

async function createInferenceWorker(req: CreateInferenceWorkerRequest) {
	const modelName = req.modelName;
	let workerName = req.workerName;

	const requestedResources = {
		quantization: req.quantization,
		gpuType: req.gpuType,
		gpuCount: req.gpuCount,
	};

	const workerId = await createInferenceWorkerController(modelName, requestedResources, workerName);

	sendEvent("createInferenceWorker", {workerName: workerName, modelName:modelName, ...requestedResources});

	return new InferenceWorker({
		workerId,
	});
}

async function pauseWorker(req: InferenceWorker) {
	const workerId = req.workerId;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === workerId);

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerId} does not exist`, Code.NotFound);
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await pause(api, ZONE, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to pause worker ${workerId}: ${e.message}`, Code.Internal);
	});

	return new InferenceWorker({
		workerId: worker.name,
	});
}

async function resumeWorker(req: InferenceWorker) {
	const workerId = req.workerId;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === encodeName(workerId));

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerId} does not exist`, Code.NotFound);
	}

	if (worker.status !== "TERMINATED") {
		throw new ConnectError(`Worker ${workerId} is not paused`, Code.FailedPrecondition);
	}

	await start(api, ZONE, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to resume worker ${workerId}: ${e.message}`, Code.Internal);
	});

	sendEvent("resumeWorker", {workerName: worker.name});

	return new InferenceWorker({
		workerId: worker.name,
	});
}

async function deleteWorker(req: InferenceWorker) {
	const workerId = req.workerId;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === workerId);

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerId} does not exist`, Code.NotFound);
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!).shutdown({});
	}

	await remove(api, ZONE, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to delete worker ${workerId}: ${e.message}`, Code.Internal);
	});

	return new InferenceWorker({
		workerId: worker.name,
	});
}

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		setup: catchErrors(auth(setupHandler)),

		generate: auth(enforceSetup(generate)),

		listModels: catchErrors(auth(enforceSetup(listModels))),

		createInferenceWorker: catchErrors(auth(enforceSetup(createInferenceWorker))),
		pauseInferenceWorker: catchErrors(auth(enforceSetup(pauseWorker))),
		resumeInferenceWorker: catchErrors(auth(enforceSetup(resumeWorker))),
		deleteInferenceWorker: catchErrors(auth(enforceSetup(deleteWorker))),
	});
