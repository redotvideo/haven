import {Code, ConnectError} from "@bufbuild/connect";
import {createComputeAPI, list} from "../gcloud/resources";
import {getWorkerIP} from "../lib/misc";
import {getTransport} from "../lib/client";

interface Settings {
	maxTokens?: number;
	temperature?: number;
	topP?: number;
	topK?: number;
	sample?: boolean;
}

export async function generateController(workerName: string, prompt: string, settings: Settings) {
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

	return getTransport(ip).generate({prompt, ...settings});
}