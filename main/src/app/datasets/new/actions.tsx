"use server";

import * as y from "yup";
import {checkSessionAction} from "~/server/utils/session";
import {revalidatePath} from "next/cache";
import {uploadDataset} from "~/server/controller/new-dataset";

import type {State} from "./form";
import {logger} from "~/server/utils/observability/logtail";

const FormDataSchema = y.object({
	name: y.string().required(),
	dropzoneFile: y.mixed().required(),
});

export type FormDataType = y.InferType<typeof FormDataSchema>;

function buildState(datasetId?: string, datasetName?: string, message?: string) {
	return {
		datasetId,
		datasetName,
		message,
	};
}

export async function uploadDatasetAction(_: State, formData: FormData) {
	const session = await checkSessionAction();

	let id: string | undefined;
	let name: string | undefined;
	try {
		const validatedForm = await FormDataSchema.validate(Object.fromEntries(formData));

		// TODO: Make sure validatedForm.dropzoneFile is a File

		id = await uploadDataset(session.user.id, validatedForm);
		name = validatedForm.name;

		revalidatePath("/datasets");
	} catch (e) {
		logger.warn("Failed to upload dataset", {error: e});
		return buildState(undefined, undefined, (e as Error).message);
	}

	return buildState(id, name, undefined);
}
