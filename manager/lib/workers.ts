import * as fs from "fs/promises";
import {compute_v1} from "googleapis";

import {WorkerStatus} from "./client/pb/worker_pb";
import {Status} from "../api/pb/manager_pb";

/**
 * Create a unique name for a worker.
 */
export async function generateName(model: string) {
	// use a MS timestamp as the base
	const ms = Date.now().toString(36);
	const modelName = model.split("/").pop()?.toLowerCase();
	return `haven-w-${modelName}-${ms}`;
}

export function getWorkerIP(worker: compute_v1.Schema$Instance | undefined) {
	return worker?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
}

export async function createStartupScript(path: string, dockerImageUrl: string, configFileString: string) {
	const file = await fs.readFile(path);
	let startupScript = file.toString();
	startupScript = startupScript.replace("{config}", configFileString);
	startupScript = startupScript.replace(/{image_url}/g, dockerImageUrl);
	return startupScript;
}

export function mapStatus(serviceStatus: WorkerStatus, vmStatus: string | undefined | null): Status {
	if (serviceStatus === WorkerStatus.OK) {
		return Status.ONLINE;
	}

	if (serviceStatus === WorkerStatus.STOPPING) {
		return Status.UNREACHABLE;
	}

	const map = {
		/**
		 * We default to unreachable for all of these
		 */
		PROVISIONING: Status.UNREACHABLE,
		STAGING: Status.UNREACHABLE,
		RUNNING: Status.UNREACHABLE,
		STOPPING: Status.UNREACHABLE,
		SUSPENDING: Status.UNREACHABLE,

		SUSPENDED: Status.PAUSED,
		TERMINATED: Status.PAUSED,

		REPAIRING: Status.ERROR,
	};

	return map[vmStatus as keyof typeof map] || Status.ERROR;
}
