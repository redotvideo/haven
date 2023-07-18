import {compute_v1} from "googleapis";
import {CloudInstance, CloudInterface} from "../interface";
import {createComputeAPI, list} from "./resources";

export class GoogleCloud implements CloudInterface {
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

	getInstancePublicIp(instanceName: string): Promise<string> {
		throw new Error("Method not implemented.");
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

	async listInstances(): Promise<CloudInstance[]> {
		const api = await this.getApi();

		const res = await list(api, this.projectId);
		return res.map((instance) => ({name: instance.name || ""}));
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
