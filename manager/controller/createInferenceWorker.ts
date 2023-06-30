import {Code, ConnectError} from "@bufbuild/connect";
import {ModelFile, getModelFile} from "../lib/models";
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

		if (result?.name !== undefined) {
			throw new ConnectError(`Worker name ${workerName} is already taken.`, Code.AlreadyExists);
		}

		return workerName;
	} else {
		// Come up with a unique name
		return generateName(modelName);
	}
}

async function checkViableZoneToDeploy(api: compute_v1.Compute, config: Required<ArchitectureConfiguration>) {
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

	return possibleZones[0]!;
}

function createWorkerConfig(modelFile: ModelFile, architectureFile: Required<ArchitectureConfiguration>) {
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
) {
	// Get architecture
	const modelFile = await checkForModelFile(modelName);
	const architecture = modelFile.architecture;

	// Validate requested configuration with architecture
	const validConfiguration = await checkArchitectureSupportsRequestedResources(architecture, requestedResources);

	const api = await createComputeAPI();

	// If a worker name was provided, check if it's already taken
	const finalName = await checkWorkerNameOrGenerate(api, modelName, workerName);

	// Get zone to deploy to
	const zone = await checkViableZoneToDeploy(api, validConfiguration);

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
