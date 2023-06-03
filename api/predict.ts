import {Request, Response} from "express";
import {createComputeAPI, list} from "../gcloud/resources";
import {config} from "../lib/config";
import {encodeName, getWorkerIP} from "../lib/misc";
import {getPrediction} from "../lib/client";

const ZONE = config.gcloud.zone;

export async function predict(req: Request, res: Response) {
	const {model} = req.params;
	console.log(req.body);
	const {prompt} = req.body;

	// Check if model exists and is running
	const api = await createComputeAPI();
	const workers = await list(api, ZONE);
	const worker = workers.find((worker) => worker.name === encodeName(model));

	const ip = getWorkerIP(worker);
	if (!ip) {
		res.status(400).send({error: "Worker not reachable."});
		return;
	}

	return getPrediction(ip, req.body.prompt)
		.then((data) => res.status(200).send(data))
		.catch((err) => {
			console.error(err);
			res.status(500).send({error: "Error getting prediction."});
		});
}
