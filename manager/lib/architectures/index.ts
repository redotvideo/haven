import * as fs from "fs/promises";
import {CreateInferenceWorkerRequest} from "../../api/pb/manager_pb";

interface ArchitectureConfiguration {
	quantization: string;
	gpuType: string;
	gpuCount: number;
}

/**
 * Checks if the requested configuration (quantization + gpu + gpu quantity)
 * is supported by the model architecture.
 */
export async function assertArchitectureSupportsConfiguration(architecture: string, req: CreateInferenceWorkerRequest) {
	const files = await fs.readdir(`./config/architectures/${architecture}`);

	// TODO(konsti): Speed up by loading these into memory when the process starts
	for (const file of files) {
		const text = await fs.readFile(`./config/architectures/${architecture}/${file}`, "utf-8");

		// TODO(konsti): Validation
		const json = JSON.parse(text) as ArchitectureConfiguration;

		if (json.quantization === req.quantization) {
			if (json.gpuType && json.gpuType !== req.gpuType) {
				continue;
			}

			if (json.gpuCount && json.gpuCount !== req.gpuCount) {
				continue;
			}

			return;
		}
	}

	throw new Error(`The requested configuration is not supported by the model architecture.`);
}
