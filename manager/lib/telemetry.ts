import crypto from "crypto";
import axios from "axios";
import typia from "typia";

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

const url = "https://versions.haven.run/api/check-version";

interface VersionCheckResponse {
	status: "current" | "outdated" | "unknown";
	current: string;
}

export async function checkForNewVersion() {
	try {
		const result = await axios.post(url, {version: config.version});
		const response = typia.createAssertEquals<VersionCheckResponse>()(result.data);

		console.log(response);

		if (response.status === "unknown" || response.status === "current") {
			console.log(response);
			return;
		}

		const warning = `WARNING: A new version of Haven is available: ${response.current}. You are currently running ${config.version} which is considered outdated. Check https://docs.haven.run/ for upgrade instructions.`;
		console.warn(warning);
		return warning;
	} catch (e) {
		console.error(e);
	}
}
