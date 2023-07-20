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

import {getTransport} from "../lib/client";
import {catchErrors, auth, admin} from "./middleware";
import {ModelFile, getAllModels, getModelFile} from "../lib/models";
import {chatCompletionController, completionController} from "../controller/generate";
import {createInferenceWorkerController} from "../controller/createInferenceWorker";
import {validate} from "./validate";
import {listWorkersController} from "../controller/workers";
import {EventName, checkForNewVersion, sendEvent} from "../lib/telemetry";
import {getAllArchitectures} from "../lib/architecture";
import {cloudManager} from "../cloud";

/////////////////////
// Setup
/////////////////////

const setupInputValid = typia.createAssertEquals<SetupRequest>();

async function setupHandler(req: SetupRequest) {
	// Check if there is a new version available and pass a warning to the client if there is.
	const warning = await checkForNewVersion();

	// If both a keyFile and a cloud provider are provided, we can update the cloud provider.
	if (req.keyFile !== undefined && req.cloud !== undefined) {
		await cloudManager.updateCloud(req.cloud, req.keyFile).catch((e) => {
			throw new ConnectError(e.message, Code.Internal);
		});
	}

	// If only one of them is provided, we throw an error.
	if (req.keyFile !== undefined || req.cloud !== undefined) {
		throw new ConnectError(
			"Please provide both a keyFile and a cloud provider to finish the setup.",
			Code.Unauthenticated,
		);
	}

	return new SetupResponse({message: warning, cloudStatus: await cloudManager.getCloudStatus()});
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

	try {
		for await (const data of stream) {
			yield new CompletionResponse({text: data.text});
		}
	} catch (e) {
		throw new ConnectError(e.message, Code.Aborted);
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

	try {
		for await (const data of stream) {
			yield new CompletionResponse({text: data.text});
		}
	} catch (e) {
		throw new ConnectError(e.message, Code.Aborted);
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

const deleteModelInputValid = typia.createAssertEquals<ModelName>();

/**
 * Remove a model from the list of custom models
 * This will not remove the model from a running worker.
 */
async function deleteModel(req: ModelName) {
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
		cloud: req.cloud,
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
	const cloudProvider = await cloudManager.getCloudByInstanceName(workerName);
	if (!cloudProvider) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	const cloud = cloudManager.get(cloudProvider);

	const ip = await cloud.getInstancePublicIp(workerName);
	if (ip) {
		await getTransport(ip)
			.shutdown({})
			.catch((e) => {
				console.error(`Error sending shutdown signal to worker ${workerName}: ${e.message}`);
			});
	}

	await cloud.pauseInstance(workerName).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to pause worker ${workerName}: ${e.message}`, Code.Internal);
	});

	// TODO: send event

	return new InferenceWorker({
		workerName,
	});
}

/////////////////////
// Resume worker
/////////////////////

async function resumeWorker(req: InferenceWorker) {
	const workerName = req.workerName;

	// Check if worker exists
	const cloudProvider = await cloudManager.getCloudByInstanceName(workerName);
	if (!cloudProvider) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	const cloud = cloudManager.get(cloudProvider);

	await cloud.resumeInstance(workerName).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to resume worker ${workerName}: ${e.message}`, Code.Internal);
	});

	// TODO: send event

	return new InferenceWorker({
		workerName,
	});
}

/////////////////////
// Delete worker
/////////////////////

async function deleteWorker(req: InferenceWorker) {
	const workerName = req.workerName;

	// Check if worker exists
	const cloudProvider = await cloudManager.getCloudByInstanceName(workerName);
	if (!cloudProvider) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	const cloud = cloudManager.get(cloudProvider);

	const ip = await cloud.getInstancePublicIp(workerName);
	if (ip) {
		await getTransport(ip)
			.shutdown({})
			.catch((e) => {
				console.error(`Error sending shutdown signal to worker ${workerName}: ${e.message}`);
			});
	}

	await cloud.deleteInstance(workerName).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to delete worker ${workerName}: ${e.message}`, Code.Internal);
	});

	// TODO: send event

	return new InferenceWorker({
		workerName,
	});
}

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		setup: catchErrors(validate(setupInputValid, auth(setupHandler))),

		chatCompletion: auth(chatCompletion),
		completion: auth(completion),

		listModels: catchErrors(validate(listModelsInputValid, auth(listModels))),
		addModel: catchErrors(validate(addModelInputValid, auth(addModel))),
		deleteModel: catchErrors(validate(deleteModelInputValid, auth(deleteModel))),

		listWorkers: catchErrors(validate(listWorkersInputValid, auth(listWorkers))),

		createInferenceWorker: catchErrors(admin(validate(createInferenceWorkerInputValid, auth(createInferenceWorker)))),
		pauseInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(pauseWorker)))),
		resumeInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(resumeWorker)))),
		deleteInferenceWorker: catchErrors(admin(validate(inferenceWorkerValid, auth(deleteWorker)))),
	});
