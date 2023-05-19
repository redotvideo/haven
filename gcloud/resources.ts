import * as fs from "fs";
import {compute_v1, google} from "googleapis";

const projectId = "boreal-charter-379616";
const zone = "europe-west4-a";

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
 * Get info on vm in zone.
 * @param api
 * @param zone
 * @param vmName
 * @returns
 */
function get(api: compute_v1.Compute, zone: string, vmName: string) {
	return api.instances.get({
		project: projectId,
		zone: zone,
		instance: vmName,
	});
}

/**
 * Pause vm using name and zone.
 * @param api
 * @param zone
 * @param vmName
 */
export async function pause(api: compute_v1.Compute, zone: string, vmName: string) {
	const request = {
		project: projectId,
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
		project: projectId,
		zone: zone,
		instance: vmName,
	};

	await api.instances.start(request);

	let started = false;
	while (!started) {
		const vm = await get(api, zone, vmName);
		started = vm.data.status === "RUNNING";
		await sleep(10000);
	}

	const vm = await get(api, zone, vmName);
	return vm.data.networkInterfaces![0].accessConfigs![0].natIP ?? undefined;
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
		project: projectId,
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
	configFilePath: string,
	startupScript: string,
) {
	const file = await fs.promises.readFile(configFilePath);
	const config = JSON.parse(file.toString());

	config["name"] = "test-1";

	config["metadata"] = {
		items: [
			{
				key: "startup-script",
				value: startupScript,
			},
		],
	};

	const request = {
		project: projectId,
		zone: zone,
		resource: config,
	};

	await api.instances.insert(request);

	let created = false;
	while (!created) {
		await sleep(10000);
		const vm = await get(api, zone, config["name"]);
		created = vm.data.status === "RUNNING";
		console.log("VM status:", vm.data.status);
	}

	const vm = await get(api, zone, config["name"]);
	return vm.data.networkInterfaces![0].accessConfigs![0].natIP;
}
