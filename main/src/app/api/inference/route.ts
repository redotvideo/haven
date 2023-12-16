import * as y from "yup";
import {defaultModelLoopup, modelsToFinetune} from "~/constants/models";
import {inferenceEndpoints} from "~/constants/modal";
import {createChatRequest, getNumberOfChatRequestsInLast24Hours} from "~/server/database/chat-request";
import {getModelFromId} from "~/server/database/model";
import {logger} from "~/server/utils/observability/logtail";
import {checkSessionAction} from "~/server/utils/session";
import {bodySchema} from "./schema";
import {EventName, sendEvent} from "~/server/utils/observability/posthog";

async function getResponse(host: string, modelId: string | undefined, validatedBody: y.InferType<typeof bodySchema>) {
	const adapter_id = modelId ? `/trained_adapters/${modelId}` : undefined;

	const body = JSON.stringify({
		parameters: {
			temperature: validatedBody.parameters.temperature,
			top_p: validatedBody.parameters.topP,
			do_sample: validatedBody.parameters.doSample,
			max_new_tokens: validatedBody.parameters.maxTokens,
			repetition_penalty: validatedBody.parameters.repetitionPenalty,
			adapter_id,
		},
		chat: validatedBody.history,
		auth_token: process.env.MODAL_AUTH_TOKEN,
	});

	console.log("sending request", body, host);

	return fetch(host, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body,
	});
}

async function retryInference(makeCall: () => Promise<Response>, logInfo: object) {
	for (let i = 0; i < 3; i++) {
		try {
			return makeCall();
		} catch (e) {
			logger.error("Inference error, try no. " + i, {...logInfo, error: e});
		}
	}

	logger.error("Inference failed after 3 attempts.", logInfo);
	throw new Error("Inference failed");
}

export async function POST(request: Request) {
	const body = await request.json();
	const validatedBody = await bodySchema.validate(body);

	const [session, model] = await Promise.all([checkSessionAction(), getModelFromId(validatedBody.modelId)]);

	sendEvent(session.user.id, EventName.INFERENCE_REQUEST, {
		modelId: validatedBody.modelId,
	});

	logger.info("Inference request", {
		modelId: validatedBody.modelId,
		userId: session.user.id,
		body: JSON.stringify(body),
	});

	// Check if user has reached their daily limit
	const last24h = await getNumberOfChatRequestsInLast24Hours(session.user.id);
	if (last24h > 100) {
		logger.info("Daily inference rate limit reached", {modelId: validatedBody.modelId});
		return new Response("Daily limit reached for free tier", {
			status: 402,
		});
	}

	// Both of these are available to all users
	const isDefaultModel = Object.keys(defaultModelLoopup).includes(validatedBody.modelId);

	// Adapter not found and not internal model
	if (!isDefaultModel && !model) {
		logger.error("Model not found", {modelId: validatedBody.modelId, userId: session.user.id});
		throw new Error("Model not found");
	}

	const baseModel = model?.baseModel || defaultModelLoopup[validatedBody.modelId as keyof typeof defaultModelLoopup];
	const baseModelValidated = y.string().oneOf(modelsToFinetune).required().validateSync(baseModel);
	const host = inferenceEndpoints[baseModelValidated];

	return retryInference(
		async () => {
			const response = await getResponse(host, model?.id, validatedBody);
			if (response.ok) {
				await createChatRequest(session.user.id, validatedBody.modelId);
			}

			return new Response(response.body);
		},
		{modelId: validatedBody.modelId},
	);
}
