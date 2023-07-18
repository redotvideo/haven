export interface CloudInstance {
	name: string;
}

export interface CloudInterface {
	isAvailable(): Promise<boolean>;

	listInstances(): Promise<CloudInstance[]>;

	getInstancePublicIp(instanceName: string): Promise<string>;

	createInstance(instanceName: string): Promise<void>;

	pauseInstance(instanceName: string): Promise<void>;

	// TODO(now): make sure that the instance is paused to begin with
	resumeInstance(instanceName: string): Promise<void>;

	deleteInstance(instanceName: string): Promise<void>;
}
