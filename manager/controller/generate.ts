import {Code, ConnectError} from "@bufbuild/connect";
import {createComputeAPI, list} from "../gcloud/resources";
import {getTransport} from "../lib/client";
import {getWorkerIP} from "../lib/workers";
import {Message} from "../api/pb/manager_pb";

// TODO: Currently unused
interface Settings {
	maxTokens?: number;
	temperature?: number;
	topP?: number;
	topK?: number;
	sample?: boolean;
}

export async function generateController(workerName: string, messages: Message[]) {
	// Check if worker exists and is running
	const api = await createComputeAPI();
	const workers = await list(api).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to get a list of all workers from GCloud: ${e.message}`, Code.Internal);
	});
	const worker = workers.find((worker) => worker.name === workerName);

	const ip = getWorkerIP(worker);
	if (!ip) {
		throw new ConnectError(`Worker ${workerName} has no public ip.`, Code.FailedPrecondition);
	}

	// TODO(konsti): check status and throw if the worker can't be reached.

	return Promise.resolve()
		.then(() => getTransport(ip).chatCompletion({messages}, {timeoutMs: 20000}))
		.catch((e) => {
			console.error(e);
			throw new ConnectError(`Failed to establish a connection.: ${e.message}`, Code.Internal);
		});
}
