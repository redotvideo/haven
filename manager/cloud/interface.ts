import {Cloud, Worker} from "../api/pb/manager_pb";

export interface CloudInterface {
	cloud: Cloud;

	isAvailable(): Promise<boolean>;

	listInstances(): Promise<Worker[]>;

	getInstancePublicIp(instanceName: string): Promise<string | undefined>;

	createInstance(instanceName: string): Promise<void>;

	pauseInstance(instanceName: string): Promise<void>;

	// TODO(now): make sure that the instance is paused to begin with
	resumeInstance(instanceName: string): Promise<void>;

	deleteInstance(instanceName: string): Promise<void>;
}
