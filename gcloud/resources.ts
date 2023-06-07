import * as fs from "fs";
import { compute_v1, google } from "googleapis";

import { config } from "../lib/config";

const projectId = config.gcloud.projectId;
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
		project: projectId,
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
			project: projectId,
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
		project: projectId,
		zone: zone,
		resource: config,
	};

	await api.instances.insert(request);
}


/**
 * Gets all zones
 * @param api
 * @returns
 */
export async function getAllZones(
	api: compute_v1.Compute,
) {

	const request = {
		project: projectId,
	};

	const res = await api.zones.list(request);
	const zones = res.data.items || [];
	
	return zones.filter((zone) => zone);
}


/**
 * Gets all regions
 * @param api
 * @returns
 */
export async function getAllRegions(
	api: compute_v1.Compute,
) {

	const request = {
		project: projectId,
	};

	const res = await api.regions.list(request);
	const regions = res.data.items || [];
	
	return regions.filter((region) => region);
}


/**
 * Gets available accelerators in specified zone
 * @param api
 * @param configFilePath
 * @returns
 */
export async function getAcceleratorsByZone(
	api: compute_v1.Compute,
	zone: string,
) {

	const request = {
		project: projectId,
		zone: zone,
	};

	const res = await api.acceleratorTypes.list(request);
	const accelerators = res.data.items || [];

	return accelerators.filter((acc) => acc);
}


const gpuTypeToQuota : { [key: string]: string } = {
	"nvidia-tesla-a100": "NVIDIA_A100_GPUS",
	"nvidia-a100-80gb": "NVIDIA_A100_80GB_GPUS",
	"nvidia-tesla-t4": "NVIDIA_T4_GPUS"
};

/**
 * Check if region's quota permits usage of specified number of GPU types
 * @param region
 * @param gpuNum
 * @param gpuName
 * @returns
 */
export async function checkIfQuotaPermitsGPUs(
	region: any,
	gpuNum: number,
	gpuName: string,
) {
	
	const quotaName = gpuTypeToQuota[gpuName];
	const quota = region.quotas.find((q : any) => q.metric == quotaName);
	const quotaPermits = (quota.limit - quota.usage) >= gpuNum
	
	return quotaPermits;
}
