import {Code, ConnectError} from "@bufbuild/connect";
import {getTransport} from "../lib/client";
import {Message} from "../api/pb/manager_pb";
import {cloudManager} from "../cloud";

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
	const cloudProvider = await cloudManager.getCloudByInstanceName(workerName);
	if (!cloudProvider) {
		throw new ConnectError(`Worker ${workerName} does not exist`, Code.NotFound);
	}

	const cloud = await cloudManager.get(cloudProvider);
	const ip = await cloud.getInstancePublicIp(workerName);
	if (!ip) {
		throw new ConnectError(`Worker ${workerName} doesn't exist or does not have a public ip.`, Code.Internal);
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

export async function completionController(
	workerName: string,
	prompt: string,
	stopTokens: string[],
	settings: Settings,
) {
	const ip = await isWorkerAvailable(workerName);

	// TODO: check status and throw if the worker can't be reached.

	return Promise.resolve()
		.then(() => getTransport(ip).completion({prompt, stopTokens, ...settings}))
		.catch((e) => {
			console.error(e);
			throw new ConnectError(`Failed to establish a connection.: ${e.message}`, Code.Internal);
		});
}
