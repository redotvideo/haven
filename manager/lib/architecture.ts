import * as fs from "fs/promises";
import {GpuType} from "../api/pb/manager_pb";

export interface ArchitectureConfiguration {
	quantization: string;
	gpuType?: GpuType;
	gpuCount?: number;
}

/**
 * Checks if the requested configuration (quantization + gpu + gpu quantity)
 * is supported by the model architecture.
 */
export async function matchArchitectureAndConfiguration(architecture: string, config: ArchitectureConfiguration) {
	const files = await fs.readdir(`./config/architectures/${architecture}`);

	// TODO(konsti): Speed up by loading these into memory when the process starts
	for (const file of files) {
		const text = await fs.readFile(`./config/architectures/${architecture}/${file}`, "utf-8");

		// TODO(konsti): Validation
		const json = JSON.parse(text) as Required<ArchitectureConfiguration>;

		if (json.quantization === config.quantization) {
			if (json.gpuType && json.gpuType !== config.gpuType) {
				continue;
			}

			if (json.gpuCount && json.gpuCount !== config.gpuCount) {
				continue;
			}

			return json;
		}
	}

	throw new Error(`The requested configuration is not supported by the model architecture.`);
}
