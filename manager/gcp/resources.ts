import * as fs from "fs";
import {compute_v1, google} from "googleapis";

import {config} from "../lib/config";
import {GpuType} from "../api/pb/manager_pb";

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
 * List all vms globally.
 * @param api
 * @returns
 */
export async function list(api: compute_v1.Compute) {
	const res = await api.instances.aggregatedList({
		project: config.gcloud.projectId,
	});

	const items = res.data.items || {};
	const vms = Object.values(items)
		.map((zone) => zone.instances || [])
		.flat();

	return vms.filter((vm) => vm);
}

/**
 * Get info on vm in zone.
 * @param api
 * @param vmName
 * @returns
 */
export async function get(api: compute_v1.Compute, vmName: string) {
	const vms = await list(api);
	const result = vms.find((vm) => vm.name === vmName);
	return result;
}

/**
 * Pause vm using name and zone.
 * @param api
 * @param vmName
 */
export async function pause(api: compute_v1.Compute, vmName: string) {
	const vms = await list(api);

	const matchingVM = vms.find((vm) => vm.name === vmName);
	if (!matchingVM) {
		throw new Error(`Instance ${vmName} not found.`);
	}

	const zone = matchingVM.zone?.split("/").pop() ?? "";

	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		instance: vmName,
	};

	return api.instances.stop(request);
}

/**
 * Starts a paused vm.
 * @param api
 * @param vmName
 * @returns
 */
export async function start(api: compute_v1.Compute, vmName: string) {
	const vms = await list(api);

	const matchingVM = vms.find((vm) => vm.name === vmName);
	if (!matchingVM) {
		throw new Error(`Instance ${vmName} not found.`);
	}

	const zone = matchingVM.zone?.split("/").pop() ?? "";

	const request = {
		project: config.gcloud.projectId,
		zone: zone,
		instance: vmName,
	};

	return api.instances.start(request);
}

/**
 * Stops and deletes a vm.
 * @param api
 * @param vmName
 * @returns
 */
export async function remove(api: compute_v1.Compute, vmName: string) {
	const vms = await list(api);

	const matchingVM = vms.find((vm) => vm.name === vmName);
	if (!matchingVM) {
		throw new Error(`Instance "${vmName}" not found.`);
	}

	const zone = matchingVM.zone?.split("/").pop() ?? "";

	const request = {
		project: config.gcloud.projectId,
		zone,
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
	template: string,
	startupScript: string,
	name: string,
) {
	const templateParsed = JSON.parse(template);

	templateParsed["metadata"] = {
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
		resource: templateParsed,
	};

	await api.instances.insert(request);

	/**
	 * Google sometimes returns a 200 but the VM does not get created.
	 *
	 * That is because some GPU resources are sometimes not available
	 * in a certain zone. Google won't tell you this. Instead it will
	 * just quietly fail.
	 *
	 * This is why we wait for 5 seconds and then check if the VM is
	 * actually created.
	 */

	await sleep(7000);

	const vm = await get(api, name);

	if (!vm || !["STAGING", "RUNNING"].includes(vm.status ?? "")) {
		throw new Error(
			"Google Cloud VM creation failed on Google's side. This sometimes " +
				"happens when resources are unavailable in a certain zone. You can " +
				"try a different zone or try again.",
		);
	}
}

/**
 * Gets all zones
 * @param api
 * @returns
 */
export async function getAllZones(api: compute_v1.Compute) {
	const request = {
		project: config.gcloud.projectId,
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
export async function getAllRegions(api: compute_v1.Compute) {
	const request = {
		project: config.gcloud.projectId,
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
export async function getAcceleratorsByZone(api: compute_v1.Compute, zone: string) {
	const request = {
		project: config.gcloud.projectId,
		zone: zone,
	};

	const res = await api.acceleratorTypes.list(request);
	const accelerators = res.data.items || [];

	return accelerators.filter((acc) => acc);
}

/**
 * Maps the gpu type enum from the protobuf definition to the gcloud name
 */
export const gpuTypeToGcloudName = Object.freeze({
	[GpuType.A100]: "nvidia-tesla-a100",
	[GpuType.A100_80GB]: "nvidia-a100-80gb",
	[GpuType.T4]: "nvidia-tesla-t4",
});

export const gcloudNameToGpuType = Object.freeze({
	"nvidia-tesla-a100": GpuType.A100,
	"nvidia-a100-80gb": GpuType.A100_80GB,
	"nvidia-tesla-t4": GpuType.T4,
});

export function instanceToGpuTypeAndCount(instance: compute_v1.Schema$Instance) {
	const gpuType = instance.guestAccelerators?.[0]?.acceleratorType;
	if (!gpuType) {
		return {
			type: null,
			count: 0,
		};
	}

	const gcloudName = gpuType.split("/").pop() ?? "";
	const type = gcloudNameToGpuType[gcloudName as unknown as keyof typeof gcloudNameToGpuType] ?? null;
	const count = instance.guestAccelerators?.[0]?.acceleratorCount ?? 0;

	return {
		type,
		count,
	};
}

/**
 * Maps google cloud config gpu names to quota names (see e.g. skeleton.json.template)
 */
const gcpGpuNameToQuota = {
	"nvidia-tesla-a100": "NVIDIA_A100_GPUS",
	"nvidia-a100-80gb": "NVIDIA_A100_80GB_GPUS",
	"nvidia-tesla-t4": "NVIDIA_T4_GPUS",
};

/**
 * Check if region's quota permits usage of specified number of GPU types
 * @param region
 * @param gpuNum
 * @param gpuName
 * @returns
 */
export async function checkIfQuotaPermitsGPUs(
	region: compute_v1.Schema$Region,
	gpuNum: number,
	gpuName: keyof typeof gcpGpuNameToQuota,
) {
	const quotaName = gcpGpuNameToQuota[gpuName];
	const quota = region.quotas?.find((q: any) => q.metric == quotaName);
	if (!quota || quota.limit == undefined || quota.usage == undefined) {
		return false;
	}

	const quotaPermits = quota.limit - quota.usage >= gpuNum;
	return quotaPermits;
}

/**
 * Find all regions whose quotas allow specified GPU types and numbers
 * @param api
 * @param gpuNum
 * @param gpuName
 * @returns
 */
export async function findRegionsWithPermissiveGPUQuotas(
	api: compute_v1.Compute,
	gpuName: keyof typeof gcpGpuNameToQuota,
	gpuNum: number,
) {
	const allRegions = await getAllRegions(api);

	const res = await Promise.all(
		allRegions.map(async (region) => {
			if (!region.name) {
				return;
			}

			return (await checkIfQuotaPermitsGPUs(region, gpuNum, gpuName)) ? region : undefined;
		}),
	);

	const filtered = res.filter((value) => value !== undefined);
	return filtered;
}

/**
 * Find all zones in which we have the required quota for the specified GPU types and numbers.
 *
 * Does NOT check for the availability of the GPU type in the zone.
 *
 * @param api
 * @param gpuName
 * @param gpuNum
 * @returns
 */
export async function getZonesToCreateVM(
	api: compute_v1.Compute,
	gpuName: keyof typeof gcpGpuNameToQuota,
	gpuNum: number,
) {
	const permissibleRegions = await findRegionsWithPermissiveGPUQuotas(api, gpuName, gpuNum);

	// TODO(konsti): this return type is super vague. get rid of null and undefined
	const permissibleZones = permissibleRegions.flatMap((region) => region?.zones);

	const res = await Promise.all(
		permissibleZones.map(async (zone) => {
			if (!zone) {
				return;
			}

			const zoneName = zone.split("/").at(-1);
			if (zoneName) {
				const accelerators = await getAcceleratorsByZone(api, zoneName);

				return accelerators.map((acc) => acc.name).includes(gpuName) ? zone : undefined;
			} else {
				throw new Error("Google Cloud API returned unexpected string for zone");
			}
		}),
	);

	const usableZones = res.filter((zoneUrl): zoneUrl is string => zoneUrl !== undefined);
	const usableZoneNames = usableZones.map((zoneUrl) => zoneUrl.split("/").at(-1));

	return usableZoneNames;
}

/**
 * Find all zones in which we can create a VM
 * @param skeletonFile
 * @param instanceName
 * @param gpuName
 * @param gpuNum
 * @param zone
 * @param diskSizeGb
 * @param cpuMachineType
 * @returns
 */
export async function createInstanceTemplate(
	skeletonFilePath: string,
	instanceName: string,
	gpuName: keyof typeof gcpGpuNameToQuota,
	gpuNum: number,
	zone: string,
	diskSizeGb: number,
	cpuMachineType: string,
) {
	const file = await fs.promises.readFile(skeletonFilePath);
	let templateString = file.toString();
	templateString = templateString.replace(/{instanceName}/g, instanceName);
	templateString = templateString.replace(/{gpuName}/g, gpuName);
	templateString = templateString.replace(/{gpuNum}/g, String(gpuNum));
	templateString = templateString.replace(/{zone}/g, zone);
	templateString = templateString.replace(/{region}/g, zone.split("-").slice(0, -1).join("-"));
	templateString = templateString.replace(/{diskSizeGb}/g, String(diskSizeGb));
	templateString = templateString.replace(/{cpuMachineType}/g, cpuMachineType);
	templateString = templateString.replace(/{projectId}/g, config.gcloud.projectId);
	templateString = templateString.replace(/{serviceAccount}/g, config.gcloud.serviceAccount);

	return templateString;
}
