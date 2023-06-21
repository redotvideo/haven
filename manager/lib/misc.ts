/**
 * The shame file. Will get sorted into other files at some point.
 */

import * as fs from "fs";
import {compute_v1} from "googleapis";
import * as WorkerAPI from "./client/pb/worker_pb";
import {Status} from "../api/pb/manager_pb";

function base36Encode(input: string): string {
	const hex = Buffer.from(input).toString("hex");
	let decimal = BigInt("0x" + hex);

	const base36Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	let output = "";
	while (decimal > 0) {
		const remainder = Number(decimal % BigInt(36));
		decimal /= BigInt(36);
		output = base36Chars[remainder] + output;
	}

	return output;
}

export function encodeName(name: string) {
	return "haven-" + base36Encode(name).toLowerCase();
}

export async function createStartupScript(path: string, dockerImageUrl: string, configFileUrl: string) {
	const file = await fs.promises.readFile(path);
	let startupScript = file.toString();
	startupScript = startupScript.replace("{config_url}", configFileUrl);
	startupScript = startupScript.replace("{image_url}", dockerImageUrl);
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

export function getWorkerIP(worker: compute_v1.Schema$Instance | undefined) {
	return worker?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
}
