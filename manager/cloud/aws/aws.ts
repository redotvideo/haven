import {Cloud, Worker} from "../../api/pb/manager_pb";
import {ArchitectureConfiguration} from "../../lib/architecture";
import {CloudInterface} from "../interface";

export class AWS implements CloudInterface {
	cloud = Cloud.AWS;

	isAvailable(): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	listInstances(): Promise<Worker[]> {
		throw new Error("Method not implemented.");
	}
	getInstancePublicIp(instanceName: string): Promise<string | undefined> {
		throw new Error("Method not implemented.");
	}
	createInstance(
		instanceName: string,
		architecture: Required<ArchitectureConfiguration>,
		config: string,
		requestedZone?: string | undefined,
	): Promise<void> {
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
