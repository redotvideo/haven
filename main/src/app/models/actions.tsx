"use server";
import * as y from "yup";

import type {State} from "./export";
import {checkSessionAction} from "~/server/utils/session";
import {getModelFromId} from "~/server/database/model";
import {logger} from "~/server/utils/observability/logtail";
import {exportEndpoint} from "~/constants/modal";

const FormDataSchema = y.object({
	modelId: y.string().required(),
	hfToken: y.string().required(),
	namespace: y.string().required(),
	name: y.string().required(),
});

export async function exportModel(state: State, payload: FormData) {
	const session = await checkSessionAction();

	// validate form data
	let validatedForm: y.InferType<typeof FormDataSchema>;
	try {
		validatedForm = await FormDataSchema.validate(Object.fromEntries(payload));
	} catch (e: unknown) {
		const error = e as Error;
		logger.error("[exportModel] Invalid form data", {error: error.message});
		return {
			success: false,
			error: error.message,
		};
	}

	// check if model belongs to user
	const model = await getModelFromId(validatedForm.modelId);
	if (!model) {
		logger.error("[exportModel] Model not found", {modelId: validatedForm.modelId});
		return {
			success: false,
			error: "Unexpected error",
		};
	}

	if (model.userId !== session.user.id) {
		logger.error("[exportModel] User does not own model", {modelId: validatedForm.modelId});
		return {
			success: false,
			error: "Unexpected error",
		};
	}

	const body = {
		hf_name: validatedForm.namespace,
		model_name: validatedForm.name,
		model_id: validatedForm.modelId,
		base_model_name: model.baseModel,
		hf_token: validatedForm.hfToken,
	};

	logger.info("[exportModel] Starting export", {body});

	const res = await fetch(exportEndpoint, {
		method: "POST",
		body: JSON.stringify(body),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (res.status === 200) {
		logger.info("[exportModel] Exported model to huggingface", {body});
		return {
			success: true,
			error: "Success!",
		};
	}

	logger.error("[exportModel] Something went wrong when exporting", {
		status: res.status,
		request: body,
		report: await res.text(),
	});
	return {
		success: false,
		error: "Something went wrong and the team has been notified.",
	};
}
