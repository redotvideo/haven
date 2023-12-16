"use server";
import {calculatePrice, createNewModelTraining} from "~/server/controller/new-model";
import * as y from "yup";
import {checkSessionAction} from "~/server/utils/session";
import {revalidatePath} from "next/cache";
import {modelsToFinetune} from "~/constants/models";

import type {State} from "./form";

const FormDataSchema = y.object({
	name: y.string().required(),
	datasetId: y.string().required(),
	learningRate: y.string().oneOf(["Low", "Medium", "High"]).required(),
	numberOfEpochs: y.number().min(1).required(),
	baseModel: y.string().oneOf(modelsToFinetune).required(),
	confirmedPrice: y.number(),
});

export type FormDataType = y.InferType<typeof FormDataSchema>;

export async function revalidate() {
	return Promise.resolve().then(() => revalidatePath("/models"));
}

function buildState(
	success: boolean,
	message: string | null,
	priceInCents: number | null,
	userHasEnoughCredits: boolean | null,
	formData: FormData | null,
): State {
	return {
		success,
		message,
		priceInCents,
		userHasEnoughCredits,
		formData,
	};
}

export async function validateAndCalculatePrice(_: State, formData: FormData) {
	const session = await checkSessionAction();

	try {
		const validatedForm = await FormDataSchema.validate(Object.fromEntries(formData));
		const priceInCents = await calculatePrice(session, validatedForm);
		const userHasEnoughCredits = session.user.centsBalance >= priceInCents;
		return buildState(false, null, priceInCents, userHasEnoughCredits, formData);
	} catch (e) {
		return buildState(false, (e as Error).message, null, null, null);
	}
}

export async function startNewTraining(_: State, formData: FormData) {
	const session = await checkSessionAction();

	try {
		const validatedForm = await FormDataSchema.validate(Object.fromEntries(formData));
		await createNewModelTraining(session, validatedForm, validatedForm.confirmedPrice);

		return buildState(true, null, null, null, null);
	} catch (e: unknown) {
		return buildState(false, (e as Error).message, null, null, null);
	}
}
