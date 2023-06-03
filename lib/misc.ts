/**
 * The shame file. Will get sorted into other files at some point.
 */

import * as fs from "fs";
import {compute_v1} from "googleapis";
import {HealthStatus} from "./client";

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

export async function createStartupScript(path: string, dockerImageUrl: string) {
	const file = await fs.promises.readFile(path);
	let startupScript = file.toString();
	startupScript = startupScript.replace("{download_url}", dockerImageUrl);
	return startupScript;
}

/**
 * TODO(konsti): fix naming inconsistencies
 */
export function mapStatus(health: HealthStatus, status: string | undefined | null) {
	if (health === "running") {
		return "running";
	}

	if (health === "stopping") {
		return "stopping";
	}

	const map = {
		PROVISIONING: "starting",
		STAGING: "starting",
		RUNNING: "starting",
		STOPPING: "stopping",
		SUSPENDING: "stopping",
		SUSPENDED: "paused",
		TERMINATED: "paused",
		REPAIRING: "error",
	};

	return map[status as keyof typeof map] || "stopped";
}

export function getWorkerIP(worker: compute_v1.Schema$Instance | undefined) {
	return worker?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
}
