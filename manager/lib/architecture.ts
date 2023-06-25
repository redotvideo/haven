import * as fs from "fs/promises";
import {GpuType} from "../api/pb/manager_pb";

export interface ArchitectureConfiguration {
	quantization: string;
	gpuType?: GpuType;
	gpuCount?: number;
	cpuMachineType: string;
}

/**
 * Checks if the requested configuration (quantization + gpu + gpu quantity)
 * is supported by the model architecture.
 */
export async function matchArchitectureAndConfiguration(
	architecture: string,
	config: Omit<ArchitectureConfiguration, "cpuMachineType">,
): Promise<Required<ArchitectureConfiguration>> {
	const files = await fs.readdir(`./config/architectures/${architecture}`);

	console.log(files);

	// TODO(konsti): Speed up by loading these into memory when the process starts
	for (const file of files) {
		const text = await fs.readFile(`./config/architectures/${architecture}/${file}`, "utf-8");
		const parsed = JSON.parse(text) as any;

		// Convert string to enum numerical value
		parsed.gpuType = GpuType[parsed.gpuType as keyof typeof GpuType];

		// TODO(konsti): Validation
		const json = parsed as Required<ArchitectureConfiguration>;

		if (json.quantization === config.quantization) {
			console.log(config.gpuType!.toString());

			if (config.gpuType && json.gpuType !== config.gpuType) {
				continue;
			}

			if (config.gpuCount && json.gpuCount !== config.gpuCount) {
				continue;
			}

			return json;
		}
	}

	throw new Error(`The requested configuration is not supported by the model architecture.`);
}
