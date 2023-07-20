import {compute_v1} from "googleapis";
import {CloudInterface} from "../interface";
import {
	createComputeAPI,
	createFromTemplate,
	createInstanceTemplate,
	get,
	getZonesToCreateVM,
	gpuTypeToGcloudName,
	list,
	pause,
	remove,
	start,
} from "./resources";
import {Cloud, Status, Worker} from "../../api/pb/manager_pb";
import {createStartupScript, mapStatus} from "../../lib/workers";
import {getStatus} from "../../lib/client";
import {config} from "../../lib/config";
import {ArchitectureConfiguration} from "../../lib/architecture";

export class GoogleCloud implements CloudInterface {
	cloud = Cloud.GCP;

	api: Promise<compute_v1.Compute | undefined>;

	projectId: string;
	serviceAccount: string;
	clientId: string;

	constructor(projectId: string, serviceAccount: string, clientId: string) {
		this.api = createComputeAPI().catch((e) => {
			console.error(`Failed to initialize GCP API. ${e}`);
			return undefined;
		});

		this.projectId = projectId;
		this.serviceAccount = serviceAccount;
		this.clientId = clientId;
	}

	private getWorkerIP(worker: compute_v1.Schema$Instance | undefined) {
		return worker?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP;
	}

	async getInstancePublicIp(instanceName: string): Promise<string> {
		const api = await this.getApi();

		const instance = await list(api, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][getInstancePublicIp] Failed to get a list of all workers from GCloud: ${e}`);
		});

		const worker = instance.find((worker) => worker.name === instanceName);
		if (!worker || !worker.name) {
			throw new Error(`[GoogleCloud][getInstancePublicIp] Worker ${instanceName} does not exist`);
		}

		const ip = this.getWorkerIP(worker);
		if (!ip) {
			throw new Error(`Worker ${instanceName} has no public ip.`);
		}

		return ip;
	}

	private async getApi(): Promise<compute_v1.Compute> {
		const api = await this.api;

		if (!api) {
			throw new Error("GCP API not initialized. Credentials might be invalid.");
		}
		return api;
	}

	async isAvailable(): Promise<boolean> {
		return this.getApi()
			.then(() => true)
			.catch((e) => {
				console.log(e);
				return false;
			});
	}

	async listInstances(): Promise<Worker[]> {
		const api = await this.getApi();

		const res = await list(api, this.projectId);
		const noNullOrUndefined = res.filter((instance) => instance.name !== null && instance.name !== undefined);
		const onlyHavenPrefix = noNullOrUndefined.filter((instance) => instance.name!.startsWith("haven-w-"));

		const instanceWithStatus = await Promise.all(
			onlyHavenPrefix.map(async (instance) => {
				// If it doesn't have a public IP, it's paused
				const ip = this.getWorkerIP(instance);
				if (!ip) {
					return new Worker({
						cloud: this.cloud,
						workerName: instance.name!,
						status: Status.PAUSED,
					});
				}

				// Get status
				const vmStatus = instance.status;
				const serviceStatus = await getStatus(ip);
				const status = mapStatus(serviceStatus, vmStatus);

				return new Worker({
					cloud: this.cloud,
					workerName: instance.name!,
					status,
				});
			}),
		);

		return instanceWithStatus;
	}

	async createInstance(
		instanceName: string,
		architecture: Required<ArchitectureConfiguration>,
		instaneConfig: string, // File that will be written to ~/config.json on the instance
		requestedZone?: string,
	): Promise<void> {
		const api = await this.getApi();

		const gcpGpuName = gpuTypeToGcloudName[architecture.gpuType];
		const zones = await getZonesToCreateVM(api, gcpGpuName, architecture.gpuCount, this.projectId);

		if (zones.length === 0) {
			throw new Error(
				"[GoogleCloud][createInstance] No zones found that support the requested configuration. You might have to request a quota increase with GCP. You can check our docs to see how that works.",
			);
		}

		if (requestedZone && !zones.includes(requestedZone)) {
			throw new Error(
				`[GoogleCloud][createInstance] Requested zone ${requestedZone} is not available for the requested configuration. This might a problem with your Google Cloud account quota.`,
			);
		}

		const zone = requestedZone || zones[0]!;

		const template = await createInstanceTemplate(
			"./config/gcp/skeleton.json.template",
			instanceName,
			gpuTypeToGcloudName[architecture.gpuType],
			architecture.gpuCount,
			zone,
			500,
			architecture.cpuMachineType,
			this.projectId,
			this.serviceAccount,
		);

		// TODO: change where the startup script path is stored
		const workerStartupScript = config.worker.startupScript;
		const workerImageUrl = config.worker.dockerImage;

		const startupScript = await createStartupScript(workerStartupScript, workerImageUrl, instaneConfig);

		await createFromTemplate(api, zone, template, startupScript, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][createInstance] Failed to create instance ${instanceName}: ${e}`);
		});
	}

	async pauseInstance(instanceName: string): Promise<void> {
		const api = await this.getApi();

		// Make sure that the instance is running
		const instance = await get(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][pauseInstance] Failed to get instance ${instanceName}: ${e}`);
		});

		if (!instance) {
			throw new Error(`[GoogleCloud][pauseInstance] Instance ${instanceName} does not exist`);
		}

		if (instance.status !== "RUNNING") {
			throw new Error(
				`[GoogleCloud][pauseInstance] Instance ${instanceName} is not running. Status: ${instance.status}`,
			);
		}

		await pause(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][pauseInstance] Failed to pause instance ${instanceName}: ${e}`);
		});
	}

	async resumeInstance(instanceName: string): Promise<void> {
		const api = await this.getApi();

		// Make sure that the instance is paused
		const instance = await get(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][resumeInstance] Failed to get instance ${instanceName}: ${e}`);
		});

		if (!instance) {
			throw new Error(`[GoogleCloud][resumeInstance] Instance ${instanceName} does not exist`);
		}

		if (instance.status !== "TERMINATED") {
			throw new Error(
				`[GoogleCloud][resumeInstance] Instance ${instanceName} is not terminated. Status: ${instance.status}`,
			);
		}

		await start(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][resumeInstance] Failed to start instance ${instanceName}: ${e}`);
		});
	}

	async deleteInstance(instanceName: string): Promise<void> {
		const api = await this.getApi();

		const instance = await get(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][deleteInstance] Failed to get instance ${instanceName}: ${e}`);
		});

		if (!instance) {
			throw new Error(`[GoogleCloud][deleteInstance] Instance ${instanceName} does not exist`);
		}

		await remove(api, instanceName, this.projectId).catch((e) => {
			console.error(e);
			throw new Error(`[GoogleCloud][deleteInstance] Failed to remove instance ${instanceName}: ${e}`);
		});
	}
}
