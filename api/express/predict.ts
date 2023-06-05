import {Request, Response} from "express";
import {createComputeAPI, list} from "../../gcloud/resources";
import {config} from "../../lib/config";
import {encodeName, getWorkerIP} from "../../lib/misc";
import {getTransport} from "../../lib/client";

const ZONE = config.gcloud.zone;

export async function predict(req: Request, res: Response) {
	const {model} = req.params;
	console.log(req.body);

	// Check if model exists and is running
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	const ip = getWorkerIP(worker);
	if (!ip) {
		res.status(400).send({error: "Worker not reachable."});
		return;
	}

	res.send();
	const stream = getTransport(ip).generateStream({prompt: req.body.prompt});
	console.log("here");
	for await (const chunk of stream) {
		// Log the chunk without a newline in the terminal
		process.stdout.write(chunk.text);
	}
	console.log(" END");
}
