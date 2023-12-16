import {createModel} from "~/server/database/model";

import {downloadFile} from "~/server/utils/modal";
import {decreaseBalance} from "~/server/database/user";
import {EventName, sendEvent} from "~/server/utils/observability/posthog";
import {checkFileValidity, processDataset} from "./process-dataset";
import {getDatasetById} from "../database/dataset";
import {logger} from "../utils/observability/logtail";
import {trainEndpoint} from "~/constants/modal";

import type {Session} from "next-auth";
import type {FormDataType} from "~/app/models/new/actions";
import type {Models} from "~/constants/models";

/**
 * Validate the file and calculate the price.
 */
async function validate(userId: string, datasetId: string, baseModel: Models, numberOfEpochs: number) {
	const datasetDb = await getDatasetById(datasetId, userId);
	if (!datasetDb) {
		logger.error("Dataset not found.");
		throw new Error("Dataset not found.");
	}

	console.log(`dataset exists, now downloading file ${datasetDb.fileName}`);

	const dataset = await downloadFile(datasetDb.fileName);

	console.log(`file downloaded, now checking validity`);

	const processedDataset = checkFileValidity(dataset);

	console.log(`file valid, now processing`);

	// Extract relevant metadata
	const metaData = await processDataset(processedDataset, baseModel, numberOfEpochs);

	console.log(`file processed, now returning`);

	return {
		...metaData,
		datasetFileName: datasetDb.fileName,
	};
}

/**
 * Calculate the price of the training job.
 * @param session
 * @param validatedForm
 */
export async function calculatePrice(session: Session, validatedForm: FormDataType) {
	console.log(`calculating price for ${validatedForm.baseModel}`);
	const {priceInCents} = await validate(
		session.user.id,
		validatedForm.datasetId,
		validatedForm.baseModel,
		validatedForm.numberOfEpochs,
	);
	sendEvent(session.user.id, EventName.FINE_TUNE_PRICE_CALCULATED, {priceInCents, baseModel: validatedForm.baseModel});
	return priceInCents;
}

/**
 * Create a new model training job.
 * @param session
 * @param validatedForm
 * @param confirmedPrice
 */
export async function createNewModelTraining(session: Session, validatedForm: FormDataType, confirmedPrice?: number) {
	const {maxTokens, gradientAccumulationSteps, perDeviceTrainBatchSize, priceInCents, datasetFileName} = await validate(
		session.user.id,
		validatedForm.datasetId,
		validatedForm.baseModel,
		validatedForm.numberOfEpochs,
	);

	// Check that the price is correct
	if (priceInCents !== confirmedPrice) {
		throw new Error("Confirmed price does not match calculated price. Please try again.");
	}

	// Check that the user has enough money
	if (session.user.centsBalance < priceInCents) {
		throw new Error("You do not have enough money to train this model.");
	}

	// Update user balance
	await decreaseBalance(session.user.id, priceInCents, `Model ${validatedForm.name}`);

	// Update stuff in the database
	const model = await createModel(
		session.user.id,
		validatedForm.name,
		priceInCents,
		validatedForm.datasetId,
		validatedForm.learningRate,
		validatedForm.numberOfEpochs,
		validatedForm.baseModel,
	);

	const pathToSend = `/datasets/${datasetFileName}`;

	// TODO: fix on Modal's side
	const model_name =
		validatedForm.baseModel === "mistralai/Mixtral-8x7b-Instruct-v0.1"
			? "/pretrained_models/models--mistralai--Mixtral-8x7B-Instruct-v0.1/snapshots/f1ca00645f0b1565c7f9a1c863d2be6ebf896b04"
			: validatedForm.baseModel;

	// Send request to create new job
	await fetch(trainEndpoint[validatedForm.baseModel], {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			wandb_token: "", // TODO: let user provide this
			learning_rate: validatedForm.learningRate,
			num_epochs: validatedForm.numberOfEpochs,
			model_name,
			model_id: model.id,
			dataset_name: pathToSend,
			hf_repo: validatedForm.name,
			max_tokens: maxTokens,
			gradient_accumulation_steps: gradientAccumulationSteps,
			per_device_train_batch_size: perDeviceTrainBatchSize,
			auth_token: process.env.MODAL_AUTH_TOKEN,
		}),
	});

	sendEvent(session.user.id, EventName.FINE_TUNE_STARTED, {priceInCents, baseModel: validatedForm.baseModel});
}
