import {Code, ConnectError} from "@bufbuild/connect";
import {createComputeAPI, list} from "../gcp/resources";
import {getTransport} from "../lib/client";
import {getWorkerIP} from "../lib/workers";
import {Message} from "../api/pb/manager_pb";

interface Settings {
	maxTokens?: number;
	topP?: number;
	topK?: number;
	temperature?: number;
}

/**
 * Checks if the worker exists and ist running
 *
 * @returns the IP of the worker
 */
async function isWorkerAvailable(workerName: string) {
	const api = await createComputeAPI();
	const workers = await list(api).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to get a list of all workers from GCloud: ${e.message}`, Code.Internal);
	});

	const worker = workers.find((worker) => worker.name === workerName);
	if (!worker || !worker.name) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	const ip = getWorkerIP(worker);
	if (!ip) {
		throw new ConnectError(`Worker ${workerName} has no public ip.`, Code.FailedPrecondition);
	}

	return ip;
}

export async function chatCompletionController(workerName: string, messages: Message[], settings: Settings) {
	const ip = await isWorkerAvailable(workerName);

	// TODO(konsti): check status and throw if the worker can't be reached.

	return Promise.resolve()
		.then(() => getTransport(ip).chatCompletion({messages, ...settings}))
		.catch((e) => {
			console.error(e);
			throw new ConnectError(`Failed to establish a connection.: ${e.message}`, Code.Internal);
		});
}

export async function completionController(workerName: string, prompt: string, settings: Settings) {
	const ip = await isWorkerAvailable(workerName);

	// TODO: check status and throw if the worker can't be reached.

	return Promise.resolve()
		.then(() => getTransport(ip).completion({prompt, ...settings}))
		.catch((e) => {
			console.error(e);
			throw new ConnectError(`Failed to establish a connection.: ${e.message}`, Code.Internal);
		});
}
