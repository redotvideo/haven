import crypto from "crypto";
import axios from "axios";
import typia from "typia";

import {PostHog} from "posthog-node";
import {config} from "./config";
import {listWorkersController} from "../controller/workers";
import {createComputeAPI, instanceToGpuTypeAndCount, list} from "../gcp/resources";
import {GpuType} from "../api/pb/manager_pb";

const client = new PostHog("phc_YpKoFD7smPe4SXRtVyMW766uP9AjUwnuRJ8hh2EJcVv", {host: "https://eu.posthog.com"});

function sha256(str: string) {
	const hash = crypto.createHash("sha256");
	return hash.update(str).digest("hex");
}

export enum EventName {
	START_MANAGER = "manager-start",

	CREATE_WORKER = "worker-create",
	DELETE_WORKER = "worker-delete",
	PAUSE_WORKER = "worker-pause",
	RESUME_WORKER = "worker-resume",

	PING = "ping",

	ERROR = "error",
}

export function sendEvent(eventName: EventName, eventProperties: object = {}) {
	if (config.telemetry) {
		try {
			client.capture({
				distinctId: sha256(config.gcloud.clientId),
				event: eventName,
				properties: eventProperties,
			});
		} catch (e) {
			console.error(e);
		}
	}
}

const url = "https://versions.haven.run/api/check-version";

interface VersionCheckResponse {
	message?: string;
}

export async function checkForNewVersion() {
	try {
		const result = await axios.post(url, {version: config.version});
		const response = typia.createAssertEquals<VersionCheckResponse>()(result.data);

		const warning = response.message;
		if (warning) {
			console.warn(warning);
		}

		return warning;
	} catch (e) {
		console.error(e);
	}
}

async function healthCheck() {
	if (!config.telemetry || !config.setupDone) {
		return;
	}

	// Get all workers
	const api = await createComputeAPI();
	const workers = await list(api).catch(() => {});

	if (!workers) {
		sendEvent(EventName.ERROR, {message: "Health check: Could not get workers."});
		return;
	}

	// Get setup for each worker
	let A100s = 0;
	let A100_80GBs = 0;
	let T4s = 0;

	for (const worker of workers) {
		const {type, count} = instanceToGpuTypeAndCount(worker);

		if (type === GpuType.A100) {
			A100s += count;
		} else if (type === GpuType.A100_80GB) {
			A100_80GBs += count;
		} else if (type === GpuType.T4) {
			T4s += count;
		}
	}

	sendEvent(EventName.PING, {A100s, A100_80GBs, T4s});
}

setInterval(() => healthCheck().catch(() => {}), 1000 * 60 * 30);
