import {compute_v1} from "googleapis";
import {CloudInterface} from "../interface";
import {createComputeAPI, list} from "./resources";
import {Cloud, Status, Worker} from "../../api/pb/manager_pb";
import {mapStatus} from "../../lib/workers";
import {getStatus} from "../../lib/client";

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

	createInstance(instanceName: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	pauseInstance(instanceName: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	resumeInstance(instanceName: string): Promise<void> {
		throw new Error("Method not implemented.");
	}

	deleteInstance(instanceName: string): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
