import * as y from "yup";
import {AutoTokenizer} from "@xenova/transformers";
import {createRepo, deleteRepo} from "@huggingface/hub";
import {logger} from "~/server/utils/observability/logtail";

import type {PreTrainedTokenizer} from "@xenova/transformers";
import type {Models} from "~/constants/models";

const fileSchema = y.object({
	messages: y
		.array(
			y
				.object({
					role: y.string().oneOf(["system", "user", "assistant"]).required(),
					content: y.string().required(),
				})
				.required(),
		)
		.required(),
});

function validateMessages(messages: y.InferType<typeof fileSchema>["messages"]): void {
	if (!messages[0]) {
		logger.info("[validateMessages] No messages found");
		throw new Error("There must be at least two messages.");
	}

	if (messages[0].role !== "system") {
		logger.info("[validateMessages] First message is not from system");
		throw new Error("The first message has to have the role 'system'.");
	}

	let lastRole = "system";

	for (const message of messages.slice(1)) {
		if (message.role !== "user" && message.role !== "assistant") {
			logger.info("[validateMessages] Invalid role", {role: message.role});
			throw new Error('Invalid role. Role must be either "user" or "assistant".');
		}

		if (message.role === lastRole) {
			logger.info("[validateMessages] Consecutive messages must have different roles");
			throw new Error("Consecutive messages must have different roles.");
		}

		lastRole = message.role;
	}

	if (lastRole !== "assistant") {
		logger.info("[validateMessages] Last message is not from assistant");
		throw new Error('The last message must be from "assistant".');
	}
}

async function getTextLengths(dataset: y.InferType<typeof fileSchema>[], model: string) {
	const tokenizer = await AutoTokenizer.from_pretrained(model);
	const sampleLengths = await Promise.all(dataset.map((data) => getSampleLength(data, tokenizer)));

	return sampleLengths;
}

async function getSampleLength(
	messageObject: y.InferType<typeof fileSchema>,
	tokenizer: PreTrainedTokenizer,
): Promise<number> {
	const combinedContent = messageObject.messages.map((message) => message.content).join(" ");
	const tokenizedContent: {input_ids: {size: number}} = await tokenizer(combinedContent);

	return tokenizedContent.input_ids.size;
}

function calculatePrice(model: Models, totalTokens: number, epochs: number) {
	const baseFeeCents = 0;

	let centsPerThousandTokens = 0.4;
	if (model === "mistralai/Mixtral-8x7b-Instruct-v0.1") {
		centsPerThousandTokens = 0.8;
	}

	const thousands = Math.ceil(totalTokens / 1000);
	return baseFeeCents + thousands * centsPerThousandTokens * epochs;
}

function calculateBatchSize(model: Models, longestTextLength: number) {
	function settings(gradientAccumulationSteps: number, perDeviceTrainBatchSize: number, maxTokens: number) {
		return {
			gradientAccumulationSteps,
			perDeviceTrainBatchSize,
			maxTokens: maxTokens,
		};
	}

	const isMixtral = model === "mistralai/Mixtral-8x7b-Instruct-v0.1";

	if (isMixtral) {
		return settings(16, 1, 2000);
	}

	if (longestTextLength < 500) {
		return settings(2, 8, 2600);
	}

	if (longestTextLength < 900) {
		return settings(4, 4, 2600);
	}

	if (longestTextLength < 1400) {
		return settings(8, 2, 2600);
	}

	return settings(16, 1, 2600);
}

/**
 * Makes sure a given dataset is valid.
 * @param fileContent
 * @returns - The validated and parsed dataset.
 */
export function checkFileValidity(fileContent: string) {
	const validatedDataset: y.InferType<typeof fileSchema>[] = [];
	for (const line of fileContent.split("\n")) {
		try {
			if (!line) {
				continue;
			}

			const jsonData = JSON.parse(line);

			const validated = fileSchema.validateSync(jsonData);
			validateMessages(validated.messages);

			validatedDataset.push(validated);
		} catch (e) {
			logger.error("Invalid JSON structure", {line, error: e});
			throw e;
		}
	}

	return validatedDataset;
}

/**
 * Calculates gradient accumulation steps, batch size and price for a given dataset.
 * @param fileContent
 * @param modelName
 * @param hfToken
 * @param epochs
 * @returns
 */
export async function processDataset(fileContent: y.InferType<typeof fileSchema>[], modelName: Models, epochs: number) {
	const sampleLengths = await getTextLengths(fileContent, modelName);
	const totalTokens = sampleLengths.reduce((a, b) => a + b, 0);
	const priceInCents = calculatePrice(modelName, totalTokens, epochs);

	const maxLength = Math.max(...sampleLengths);
	const {maxTokens, gradientAccumulationSteps, perDeviceTrainBatchSize} = calculateBatchSize(modelName, maxLength);

	return {
		gradientAccumulationSteps,
		perDeviceTrainBatchSize,
		maxTokens,
		priceInCents,
	};
}

/**
 * Checks if a huggingface repo name is available by trying to create and delete it.
 * @param hfToken
 * @param name - shape: "username/repo-name"
 */
export async function checkRepoNameAvailability(hfToken: string, name: string) {
	try {
		await createRepo({
			repo: {
				name,
				type: "model",
			},
			credentials: {
				accessToken: hfToken,
			},
			private: true,
		});
		await deleteRepo({
			repo: {
				name,
				type: "model",
			},
			credentials: {
				accessToken: hfToken,
			},
		});
	} catch (e) {
		logger.error("Repo name already taken", {name, error: e});
		throw new Error("This repo name is already taken.");
	}
}
