import * as fs from "fs/promises";
import {Cloud, GpuType} from "../api/pb/manager_pb";
import typia from "typia";

export interface ArchitectureConfiguration {
	cloud: Cloud;
	quantization: string;
	gpuType?: GpuType;
	gpuCount?: number;
	cpuMachineType: string;
	contextSize: number;
}

/**
 * Checks if the requested configuration (quantization + gpu + gpu quantity)
 * is supported by the model architecture.
 */
export async function matchArchitectureAndConfiguration(
	architecture: string,
	config: Partial<ArchitectureConfiguration>,
): Promise<Required<ArchitectureConfiguration>> {
	const files = await fs.readdir(`./config/architectures/${architecture}`);

	// TODO(konsti): Speed up by loading these into memory when the process starts
	for (const file of files) {
		const text = await fs.readFile(`./config/architectures/${architecture}/${file}`, "utf-8");
		const parsed = JSON.parse(text) as any;

		// Convert string to enum numerical value
		parsed.gpuType = GpuType[parsed.gpuType as keyof typeof GpuType];
		parsed.cloud = Cloud[parsed.cloud.toUpperCase() as keyof typeof Cloud];

		const configValid = typia.createAssertEquals<Required<ArchitectureConfiguration>>();
		const json = configValid(parsed);

		if (json.cloud !== parsed.cloud) {
			continue;
		}

		if (json.quantization !== config.quantization) {
			continue;
		}

		if (config.gpuType !== undefined && json.gpuType !== config.gpuType) {
			continue;
		}

		if (config.gpuCount !== undefined && json.gpuCount !== config.gpuCount) {
			continue;
		}

		return json;
	}

	throw new Error(`The requested configuration is not supported by the model architecture or cloud provider.`);
}

export function getAllArchitectures() {
	return fs.readdir("./config/architectures");
}
