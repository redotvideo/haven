import * as fs from "fs/promises";
import {compute_v1} from "googleapis";

import * as WorkerAPI from "./client/pb/worker_pb";
import {Status} from "../api/pb/manager_pb";

/**
 * Create a unique name for a worker.
 */
export async function generateName(model: string) {
	// use a MS timestamp as the base
	const ms = Date.now().toString(36);
	return `haven-${model}-${ms}`;
}

export function getWorkerIP(worker: compute_v1.Schema$Instance | undefined) {
	return worker?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
}

export async function createStartupScript(path: string, dockerImageUrl: string, configFileUrl: string) {
	const file = await fs.readFile(path);
	let startupScript = file.toString();
	startupScript = startupScript.replace("{config_url}", configFileUrl);
	startupScript = startupScript.replace(/{image_url}/g, dockerImageUrl);
	return startupScript;
}

export function mapStatus(workerStatus: WorkerAPI.Status, cloudStatus: string | undefined | null): Status {
	if (workerStatus === WorkerAPI.Status.OK) {
		return Status.RUNNING;
	}

	if (workerStatus === WorkerAPI.Status.STOPPING) {
		return Status.STOPPING;
	}

	const map = {
		PROVISIONING: Status.STARTING,
		STAGING: Status.STARTING,

		/**
		 * If the underlying cloud vm is running but the worker is not,
		 * we assume that the worker is starting.
		 *
		 * TODO(konsti): this sucks. when the docker container is not running,
		 * something could also be wrong and we wouldn't know.
		 */
		RUNNING: Status.STARTING,

		STOPPING: Status.STOPPING,
		SUSPENDING: Status.STOPPING,
		SUSPENDED: Status.PAUSED,
		TERMINATED: Status.PAUSED,
		REPAIRING: Status.ERROR,
	};

	return map[cloudStatus as keyof typeof map] || Status.STOPPED;
}
