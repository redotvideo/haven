import * as fs from "fs";
import {compute_v1, google} from "googleapis";

import {config} from "../lib/config";

const zone = config.gcloud.zone;

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createComputeAPI() {
	const auth = await google.auth.getClient({
		scopes: ["https://www.googleapis.com/auth/cloud-platform"],
	});

	google.options({
		auth: auth,
	});

	return google.compute("v1");
}

/**
 * List all vms in zone.
 * @param api
 * @param zone
 * @returns
 */
export async function list(api: compute_v1.Compute, zone: string) {
	const res = await api.instances.list({
		project: config.gcloud.projectId,
		zone: zone,
	});

	const vms = res.data.items || [];
	return vms.filter((vm) => vm);
}

/**
 * Get info on vm in zone.
 * @param api
 * @param zone
 * @param vmName
 * @returns
 */
export async function get(api: compute_v1.Compute, zone: string, vmName: string) {
	return (
		await api.instances.get({
			project: config.gcloud.projectId,
			zone: zone,
			instance: vmName,
		})
	).data;
}

/**
 * Pause vm using name and zone.
 * @param api
 * @param zone
 * @param vmName
 */
export async function pause(api: compute_v1.Compute, zone: string, vmName: string) {
	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		instance: vmName,
	};

	const res = await api.instances.stop(request);
}

/**
 * Starts a paused vm and returns the new external IP of the VM if it has one.
 * @param api
 * @param zone
 * @param vmName
 * @returns
 */
export async function start(api: compute_v1.Compute, zone: string, vmName: string) {
	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		instance: vmName,
	};

	await api.instances.start(request);

	let started = false;
	while (!started) {
		const vm = await get(api, zone, vmName);
		started = vm.status === "RUNNING";
		await sleep(10000);
	}

	const vm = await get(api, zone, vmName);
	return vm.networkInterfaces![0].accessConfigs![0].natIP ?? undefined;
}

/**
 * Stops and deletes a vm.
 * @param api
 * @param zone
 * @param vmName
 * @returns
 */
export async function remove(api: compute_v1.Compute, zone: string, vmName: string) {
	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		instance: vmName,
	};

	return api.instances.delete(request);
}

/**
 * Creates a VM from a template
 * @param api
 * @param zone
 * @param configFilePath
 * @returns
 */
export async function createFromTemplate(
	api: compute_v1.Compute,
	zone: string,
	configFile: string,
	startupScript: string,
	name: string,
) {
	const config = JSON.parse(configFile);

	config["name"] = name;

	config["metadata"] = {
		items: [
			{
				key: "startup-script",
				value: startupScript,
			},
		],
	};

	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		resource: config,
	};

	await api.instances.insert(request);
}
