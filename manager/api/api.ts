import {ConnectError, Code, ConnectRouter} from "@bufbuild/connect";
import typia from "typia";

import {Haven} from "./pb/manager_connect";
import {
	ChatCompletionRequest,
	ChatCompletionResponse,
	CreateInferenceWorkerRequest,
	Empty,
	GpuType,
	InferenceWorker,
	ListModelsResponse,
	ListWorkersResponse,
	SetupRequest,
	SetupResponse,
} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, instanceToGpuTypeAndCount, list, pause, remove, start} from "../gcp/resources";
import {getTransport} from "../lib/client";
import {catchErrors, enforceSetup, auth} from "./middleware";
import {getAllModels} from "../lib/models";
import {setupController} from "../controller/setup";
import {generateController} from "../controller/generate";
import {createInferenceWorkerController} from "../controller/createInferenceWorker";
import {getWorkerIP} from "../lib/workers";
import {validate} from "./validate";
import {listWorkersController} from "../controller/workers";
import {EventName, checkForNewVersion, sendEvent} from "../lib/telemetry";

/////////////////////
// Setup
/////////////////////

const setupInputValid = typia.createAssertEquals<SetupRequest>();

/**
 * Set up the manager by providing the Google Cloud key.
 */
async function setupHandler(req: SetupRequest) {
	// Check if there is a new version available and pass a warning to the client if there is.
	const warning = await checkForNewVersion();

	if (config.setupDone) {
		// Endpoint is being called as "ping" to check if the setup is done.
		// It is, so we return.
		return new SetupResponse({message: warning});
	}

	const file = req.keyFile;

	if (file === undefined) {
		// Endpoint is being called as "ping" to check if the setup is done.
		// It's not, but we also can't do the setup now, so we throw an error.
		throw new ConnectError("Setup not complete.", Code.FailedPrecondition);
	}

	// Now we can assume that the setup is not done and the user wants to finish it.
	await setupController(file);
	return new SetupResponse({message: warning});
}

/////////////////////
// Generate text
/////////////////////

/**
 * Generate text from a prompt.
 */
async function* chatCompletion(req: ChatCompletionRequest) {
	const workerName = req.workerName;
	const messages = req.messages;

	const {maxTokens, topP, topK, temperature} = req;

	const stream = await generateController(workerName, messages, {maxTokens, topP, topK, temperature});

	for await (const data of stream) {
		yield new ChatCompletionResponse({text: data.text});
	}
}

/////////////////////
// List models
/////////////////////

const listModelsInputValid = typia.createAssertEquals<Empty>();

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

/////////////////////
// List workers
/////////////////////

const listWorkersInputValid = typia.createAssertEquals<Empty>();

/**
 * Get a list of all workers and their status.
 */
async function listWorkers(req: Empty) {
	const workerList = await listWorkersController();

	return new ListWorkersResponse({
		workers: workerList,
	});
}

/////////////////////
// Create inference worker
/////////////////////

interface CreateInferenceWorkerRequestExtended extends CreateInferenceWorkerRequest {
	/**
	 * Name of a worker always needs to start with haven-w-
	 */
	workerName?: `haven-w-${string}`;
}

const createInferenceWorkerInputValid = typia.createAssertEquals<CreateInferenceWorkerRequestExtended>();

async function createInferenceWorker(req: CreateInferenceWorkerRequest) {
	const modelName = req.modelName;
	const worker = req.workerName;
	const zone = req.zone;

	const requestedResources = {
		quantization: req.quantization,
		gpuType: req.gpuType,
		gpuCount: req.gpuCount,
	};

	const workerName = await createInferenceWorkerController(modelName, requestedResources, worker, zone);
	sendEvent(EventName.CREATE_WORKER, {gpuType: req.gpuType ? GpuType[req.gpuType] : undefined, gpuCount: req.gpuCount});

	return new InferenceWorker({
		workerName,
	});
}

/////////////////////
// Pause worker
/////////////////////

const inferenceWorkerValid = typia.createAssertEquals<InferenceWorker>();

async function pauseWorker(req: InferenceWorker) {
	const workerName = req.workerName;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === workerName);

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!)
			.shutdown({})
			.catch((e) => {
				console.error(`Error sending shutdown signal to worker ${workerName}: ${e.message}`);
			});
	}

	await pause(api, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to pause worker ${workerName}: ${e.message}`, Code.Internal);
	});

	const {type, count} = instanceToGpuTypeAndCount(worker);
	sendEvent(EventName.PAUSE_WORKER, {gpuType: type ? GpuType[type] : undefined, gpuCount: count});

	return new InferenceWorker({
		workerName: worker.name,
	});
}

/////////////////////
// Resume worker
/////////////////////

async function resumeWorker(req: InferenceWorker) {
	const workerName = req.workerName;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === workerName);

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	if (worker.status !== "TERMINATED") {
		throw new ConnectError(`Worker ${workerName} is not paused`, Code.FailedPrecondition);
	}

	await start(api, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to resume worker ${workerName}: ${e.message}`, Code.Internal);
	});

	const {type, count} = instanceToGpuTypeAndCount(worker);
	sendEvent(EventName.RESUME_WORKER, {gpuType: type ? GpuType[type] : undefined, gpuCount: count});

	return new InferenceWorker({
		workerName: worker.name,
	});
}

/////////////////////
// Delete worker
/////////////////////

async function deleteWorker(req: InferenceWorker) {
	const workerName = req.workerName;

	// Check if worker exists
	const api = await createComputeAPI();
	const workers = await list(api);
	const worker = workers.find((worker) => worker.name === workerName);

	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	if (getWorkerIP(worker)) {
		await getTransport(getWorkerIP(worker)!)
			.shutdown({})
			.catch((e) => {
				console.error(`Error sending shutdown signal to worker ${workerName}: ${e.message}`);
			});
	}

	await remove(api, worker.name).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to delete worker ${workerName}: ${e.message}`, Code.Internal);
	});

	const {type, count} = instanceToGpuTypeAndCount(worker);
	sendEvent(EventName.DELETE_WORKER, {gpuType: type ? GpuType[type] : undefined, gpuCount: count});

	return new InferenceWorker({
		workerName: worker.name,
	});
}

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		setup: catchErrors(validate(setupInputValid, auth(setupHandler))),

		chatCompletion: auth(enforceSetup(chatCompletion)),

		listModels: catchErrors(validate(listModelsInputValid, auth(enforceSetup(listModels)))),
		listWorkers: catchErrors(validate(listWorkersInputValid, auth(enforceSetup(listWorkers)))),

		createInferenceWorker: catchErrors(
			validate(createInferenceWorkerInputValid, auth(enforceSetup(createInferenceWorker))),
		),
		pauseInferenceWorker: catchErrors(validate(inferenceWorkerValid, auth(enforceSetup(pauseWorker)))),
		resumeInferenceWorker: catchErrors(validate(inferenceWorkerValid, auth(enforceSetup(resumeWorker)))),
		deleteInferenceWorker: catchErrors(validate(inferenceWorkerValid, auth(enforceSetup(deleteWorker)))),
	});
