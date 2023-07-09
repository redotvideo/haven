import {Code, ConnectError} from "@bufbuild/connect";
import {getModelFile} from "../lib/models";
import {ArchitectureConfiguration, matchArchitectureAndConfiguration} from "../lib/architecture";
import {
	createComputeAPI,
	createFromTemplate,
	createInstanceTemplate,
	get,
	getZonesToCreateVM,
	gpuTypeToGcloudName,
} from "../gcp/resources";
import {createStartupScript, generateName} from "../lib/workers";
import {compute_v1} from "googleapis";
import {config} from "../lib/config";
import {Model} from "../api/pb/manager_pb";

/**
 * Takes in a model name and returns the name of the corresponding config/architectures folder.
 * @param modelName
 * @returns
 */
async function checkForModelFile(modelName: string) {
	return await getModelFile(modelName).catch((e) => {
		console.error(e);
		throw new ConnectError(
			`Could not get model architecture. Please make sure the model has been added beforehand. Message: ${e.message}`,
			Code.FailedPrecondition,
		);
	});
}

async function checkArchitectureSupportsRequestedResources(
	architecture: string,
	config: Partial<ArchitectureConfiguration>,
) {
	return matchArchitectureAndConfiguration(architecture, config).catch((e) => {
		console.error(e);
		throw new ConnectError(
			"The configuration you requested (Model Architecture + GPU Type + GPU Count + Quantization) is not valid. Please refer to the documentation to see which configurations are supported.",
			Code.InvalidArgument,
		);
	});
}

async function checkWorkerNameOrGenerate(api: compute_v1.Compute, modelName: string, workerName?: string) {
	// If a worker name was provided, check if it is already taken
	if (workerName) {
		const result = await get(api, workerName).catch((e) => {
			console.error(e);
			throw new ConnectError(
				`Error while checking if worker name ${workerName} is already taken: ${e.message}`,
				Code.Internal,
			);
		});

		/**
		 * If it's already taken, we assume that the worker is being created as part of setup script.
		 * In that case, we don't want to throw an error, but instead just return an empty string.
		 *
		 * TODO: we could also check if
		 * - the worker is running
		 * - the worker has the same specs as the requested worker
		 */
		if (result?.name !== undefined) {
			console.log(`Worker ${workerName} already exsits so we do nothing.`);
			return "";
		}

		return workerName;
	} else {
		// Come up with a unique name
		return generateName(modelName);
	}
}

async function checkViableZoneToDeploy(
	api: compute_v1.Compute,
	config: Required<ArchitectureConfiguration>,
	requestedZone?: string,
) {
	// Get possible zones to deploy to
	const gcpGpuName = gpuTypeToGcloudName[config.gpuType];
	const possibleZones = await getZonesToCreateVM(api, gcpGpuName, config.gpuCount);

	// No zone found that supports the requested configuration
	if (possibleZones.length === 0) {
		throw new ConnectError(
			"No zones found that support the requested configuration. You might have to request a quoate increase with GCP. You can refer to the documentation to see how that works.",
			Code.FailedPrecondition,
		);
	}

	// If a zone was requested, check if it is viable
	if (requestedZone) {
		const zoneExists = possibleZones.includes(requestedZone);
		if (!zoneExists) {
			throw new ConnectError(
				`The requested zone ${requestedZone} does not support the requested configuration. Possible zones are: ${possibleZones.join(
					", ",
				)}.`,
				Code.InvalidArgument,
			);
		}

		return requestedZone;
	}

	// If no zone was requested, return the first viable zone
	return possibleZones[0]!;
}

function createWorkerConfig(modelFile: Model, architectureFile: Required<ArchitectureConfiguration>) {
	const workerConfig = {
		...modelFile,
		...architectureFile,
	};

	return JSON.stringify(workerConfig);
}

export async function createInferenceWorkerController(
	modelName: string,
	requestedResources: Partial<ArchitectureConfiguration>,
	workerName?: string,
	requestedZone?: string,
) {
	// Get architecture
	const modelFile = await checkForModelFile(modelName);
	const architecture = modelFile.architecture;

	// Validate requested configuration with architecture
	const validConfiguration = await checkArchitectureSupportsRequestedResources(architecture, requestedResources);

	const api = await createComputeAPI();

	// If a worker name was provided, check if it's already taken
	const finalName = await checkWorkerNameOrGenerate(api, modelName, workerName);
	if (finalName === "") {
		return workerName!;
	}

	// Get zone to deploy to
	const zone = await checkViableZoneToDeploy(api, validConfiguration, requestedZone);

	// Create GCP instance template
	const template = await createInstanceTemplate(
		"./config/gcp/skeleton.json.template",
		finalName,
		gpuTypeToGcloudName[validConfiguration.gpuType],
		validConfiguration.gpuCount,
		zone,
		500,
		validConfiguration.cpuMachineType,
	);

	// Create instance from template
	const workerStartupScript = config.worker.startupScript;
	const workerImageUrl = config.worker.dockerImage;
	const workerConfig = createWorkerConfig(modelFile, validConfiguration);

	const startupScript = await createStartupScript(workerStartupScript, workerImageUrl, workerConfig);

	await createFromTemplate(api, zone, template, startupScript, finalName).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to create worker: ${e.message}`, Code.Internal);
	});

	return finalName;
}
