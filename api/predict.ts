import {ConnectRouter} from "@bufbuild/connect";

import {Haven} from "./pb/manager_connect";
import {GenerateResponse} from "./pb/manager_pb";

import {config} from "../lib/config";
import {createComputeAPI, list} from "../gcloud/resources";
import {encodeName, getWorkerIP} from "../lib/misc";
import {getTransport} from "../lib/client";

const ZONE = config.gcloud.zone;

export const haven = (router: ConnectRouter) =>
	router.service(Haven, {
		generate: async function* (req) {
			const model = req.model;
			const prompt = req.prompt;

			// Check if model exists and is running
			const api = await createComputeAPI();
			const workers = await list(api, ZONE);
			const worker = workers.find((worker) => worker.name === encodeName(model));

			const ip = getWorkerIP(worker);
			if (!ip) {
				return;
			}

			const stream = getTransport(ip).generateStream({prompt});

			for await (const chunk of stream) {
				yield new GenerateResponse({text: chunk.text});
			}
		},
	});
