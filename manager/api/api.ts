import * as fs from "fs/promises";

import {ConnectError, Code, ConnectRouter} from "@bufbuild/connect";
import typia from "typia";

import {Haven} from "./pb/manager_connect";
import {
	ChatCompletionRequest,
	CompletionRequest,
	CompletionResponse,
	CreateInferenceWorkerRequest,
	Empty,
	GpuType,
	InferenceWorker,
	ListModelsResponse,
	ListWorkersResponse,
	Model,
	ModelName,
	SetupRequest,
	SetupResponse,
} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, instanceToGpuTypeAndCount, list, pause, remove, start} from "../gcp/resources";
import {getTransport} from "../lib/client";
import {catchErrors, enforceSetup, auth, admin} from "./middleware";
import {ModelFile, getAllModels, getModelFile} from "../lib/models";
import {setupController} from "../controller/setup";
import {chatCompletionController, completionController} from "../controller/generate";
import {createInferenceWorkerController} from "../controller/createInferenceWorker";
import {getWorkerIP} from "../lib/workers";
import {validate} from "./validate";
import {listWorkersController} from "../controller/workers";
import {EventName, checkForNewVersion, sendEvent} from "../lib/telemetry";
import {getAllArchitectures} from "../lib/architecture";

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

	if (config.setupDone || req.keyFile === undefined) {
		// Endpoint is being called as "ping". We just return a version warning if there is one.
		return new SetupResponse({message: warning});
	}

	// Now we can assume that the setup is not done and the user wants to finish it.
	await setupController(req.keyFile);
	return new SetupResponse({message: warning});
}

/////////////////////
// Generate text
/////////////////////

/**
 * Generate text from a chat history.
 */
async function* chatCompletion(req: ChatCompletionRequest) {
	const workerName = req.workerName;
	const messages = req.messages;

	const {maxTokens, topP, topK, temperature} = req;

	const stream = await chatCompletionController(workerName, messages, {maxTokens, topP, topK, temperature});

	for await (const data of stream) {
		yield new CompletionResponse({text: data.text});
	}
}

/**
 * Generate text from a prompt.
 */
async function* completion(req: CompletionRequest) {
	const workerName = req.workerName;
	const prompt = req.prompt;
	const stopTokens = req.stopTokens;

	const {maxTokens, topP, topK, temperature} = req;

	const stream = await completionController(workerName, prompt, stopTokens, {maxTokens, topP, topK, temperature});

	for await (const data of stream) {
		yield new CompletionResponse({text: data.text});
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
		.then((models) => new ListModelsResponse({models}))
		.catch((e) => {
			throw new ConnectError(e.message, Code.Internal);
		});
}

/////////////////////
// Add model
/////////////////////

interface ModelExtended extends Model {
	/**
	 * Name of a model always needs to start with `@huggingface/.
	 */
	name: `@huggingface/${string}`;
}

const addModelInputValid = typia.createAssertEquals<ModelExtended>();

/**
 * Add a model to the list of available models.
 * This will not create a worker for the model.
 */
async function addModel(req: ModelExtended) {
	// Check that either all optional parameters are set or none of them.
	try {
		typia.assert<ModelFile>(req);
	} catch (e) {
		throw new ConnectError("You need to provide either all optional parameters or none of them.", Code.InvalidArgument);
	}

	// Check that the architecture exists
	const architectures = await getAllArchitectures();
	if (!architectures.includes(req.architecture)) {
		throw new ConnectError(`Architecture ${req.architecture} does not exist.`, Code.InvalidArgument);
	}

	// Check if file with model name already exists
	const models = await getAllModels();
	if (models.find((model) => model.name === req.name)) {
		throw new ConnectError(`Model with name ${req.name} already exists.`, Code.AlreadyExists);
	}

	// Check that ./config/models/custom exists, if not create it
	await fs.mkdir("./config/models/custom", {recursive: true}).catch(() => {});

	// Write model to file
	const fileName = `${req.name.split("/")[1]}-${req.name.split("/")[2]}.json`;
	await fs.writeFile(`./config/models/custom/${fileName}`, JSON.stringify(req));
}

/////////////////////
// Remove model
/////////////////////

const removeModelInputValid = typia.createAssertEquals<ModelName>();

/**
 * Remove a model from the list of custom models
 * This will not remove the model from a running worker.
 */
async function removeModel(req: ModelName) {
	const model = await getModelFile(req.name, true);

	if (!model) {
		throw new ConnectError(`Custom model ${req.name} does not exist.`, Code.NotFound);
	}

	await fs.unlink(model.path);
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
		completion: auth(enforceSetup(completion)),

		listModels: catchErrors(validate(listModelsInputValid, auth(enforceSetup(listModels)))),
		addModel: catchErrors(validate(addModelInputValid, auth(enforceSetup(addModel)))),
		removeModel: catchErrors(validate(removeModelInputValid, auth(enforceSetup(removeModel)))),

		listWorkers: catchErrors(validate(listWorkersInputValid, auth(enforceSetup(listWorkers)))),

		createInferenceWorker: catchErrors(
			admin(validate(createInferenceWorkerInputValid, auth(enforceSetup(createInferenceWorker)))),
		),
		pauseInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(enforceSetup(pauseWorker))))),
		resumeInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(enforceSetup(resumeWorker))))),
		deleteInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(enforceSetup(deleteWorker))))),
	});
