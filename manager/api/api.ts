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
import {enforceSetup, secure} from "./middleware";
import {setup} from "../lib/setup";
import {getAllModels, getModelArchitecture} from "../lib/models";
import {assertArchitectureSupportsConfiguration} from "../lib/architectures";

const DOCKER_IMAGE = config.worker.dockerImage;
const ZONE = config.gcloud.zone;
const BUCKET = config.gcloud.bucket;

const WORKER_CONFIGURATION = config.worker.configFile;
const WORKER_STARTUP_SCRIPT = config.worker.startupScript;

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

	const isValidJson = await Promise.resolve()
		.then(() => JSON.parse(file))
		.then(() => true)
		.catch(() => false);

	// TODO(konsti): Check that the key actually works by making some test request
	if (!isValidJson) {
		throw new ConnectError("Invalid key file", Code.InvalidArgument);
	}

	await fs.promises.writeFile("./key.json", file);

	await setup().catch((err) => {
		throw new ConnectError(err.message, Code.Internal);
	});
}

/**
 * Generate text from a prompt.
 */
async function* generate(req: GenerateRequest) {
	const workerName = req.workerName;
	const prompt = req.prompt;

	const {maxTokens, temperature, topP, topK, sample} = req;

	// Check if worker exists and is running
	const api = await createComputeAPI();
	const workers = await list(api, ZONE).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to get a list of all workers from GCloud: ${e.message}`, Code.Internal);
	});
	const worker = workers.find((worker) => worker.name === workerName);

	const ip = getWorkerIP(worker);
	if (!ip) {
		throw new ConnectError(`Worker ${workerName} has no public ip.`, Code.FailedPrecondition);
	}

	const stream = getTransport(ip).generate({prompt, maxTokens, temperature, topP, topK, sample});

	for await (const chunk of stream) {
		yield new GenerateResponse({text: chunk.text});
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

	const architecture = await getModelArchitecture(modelName).catch((e) => {
		console.error(e);
		throw new ConnectError(
			"Could not get model architecture. Please make sure the model has been added beforehand.",
			Code.FailedPrecondition,
		);
	});

	await assertArchitectureSupportsConfiguration(architecture, req).catch((e) => {
		console.error(e);
		throw new ConnectError(
			"The configuration you requested (Model Architecture + GPU Type + GPU Count + Quantization) is not valid. Please refer to the documentation to see which configurations are supported.",
			Code.InvalidArgument,
		);
	});

	// TODO(konsti): Finish imlementing this endpoint

	/*const api = await createComputeAPI();

	try {
		const workerImageUrl = await generateSignedUrl(BUCKET, `worker/${DOCKER_IMAGE}.tar`);
		const configFileUrl = await generateSignedUrl(BUCKET, `models/${modelName}/config.json`);

		const startupScript = await createStartupScript(WORKER_STARTUP_SCRIPT, workerImageUrl, configFileUrl);
		const configFile = await fs.promises.readFile(WORKER_CONFIGURATION, {encoding: "utf-8"});
		await createFromTemplate(api, ZONE, configFile, startupScript, encodeName(modelName));
	} catch (e) {
		throw new ConnectError(e.message, Code.Internal);
	}*/

	return new InferenceWorker({
		workerId: "NOT_IMPLEMENTED",
	});
}

async function pauseWorker(req: InferenceWorker) {
	const workerId = req.workerId;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
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
	const workers = await list(api, ZONE);
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

	return new InferenceWorker({
		workerId: worker.name,
	});
}

async function deleteWorker(req: InferenceWorker) {
	const workerId = req.workerId;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
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
		setup: secure(setupHandler),

		generate: secure(enforceSetup(generate)),
		listModels: secure(enforceSetup(listModels)),

		createInferenceWorker: secure(enforceSetup(createInferenceWorker)),
		pauseInferenceWorker: secure(enforceSetup(pauseWorker)),
		resumeInferenceWorker: secure(enforceSetup(resumeWorker)),
		deleteInferenceWorker: secure(enforceSetup(deleteWorker)),
	});
