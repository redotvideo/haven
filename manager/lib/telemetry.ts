import crypto from "crypto";

import {PostHog} from "posthog-node";
import {config} from "./config";

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
