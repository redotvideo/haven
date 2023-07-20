import {Code, ConnectError} from "@bufbuild/connect";
import {ModelFile, getModelFile} from "../lib/models";
import {ArchitectureConfiguration, matchArchitectureAndConfiguration} from "../lib/architecture";
import {generateName} from "../lib/workers";
import {cloudManager} from "../cloud";

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

async function checkWorkerNameOrGenerate(modelName: string, workerName?: string) {
	// If a worker name was provided, check if it is already taken
	if (workerName) {
		const isTaken = await cloudManager.isInstanceNameTaken(workerName);
		if (isTaken) {
			throw new ConnectError(
				`The requested worker name ${workerName} is already taken. Please choose a different name.`,
				Code.AlreadyExists,
			);
		}

		return workerName;
	} else {
		// Come up with a unique name
		return generateName(modelName);
	}
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
	requestedZone?: string,
) {
	// Get architecture
	const modelFile = await checkForModelFile(modelName);
	const architecture = modelFile.model.architecture;

	// Validate requested configuration with architecture
	const validConfiguration = await checkArchitectureSupportsRequestedResources(architecture, requestedResources);

	// Check if worker name is available or generate a new one
	const finalName = await checkWorkerNameOrGenerate(modelName, workerName);

	// Create worker config
	const workerConfig = createWorkerConfig(modelFile.model, validConfiguration);

	await cloudManager
		.get(validConfiguration.cloud)
		.createInstance(finalName, validConfiguration, workerConfig, requestedZone)
		.catch((e) => {
			console.error(e);
			throw new ConnectError(`Failed to create worker. Message: ${e.message}`, Code.Internal);
		});

	return finalName;
}
