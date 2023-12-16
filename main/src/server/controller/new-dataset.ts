import {promises as fs} from "fs";
import {v4 as uuid} from "uuid";
import {checkFileValidity} from "./process-dataset";
import {createDataset} from "../database/dataset";
import {uploadFile} from "../utils/modal";

import type {FormDataType} from "~/app/datasets/new/actions";
import {logger} from "../utils/observability/logtail";

export async function uploadDataset(userId: string, validatedForm: FormDataType) {
	const datasetText = await (validatedForm.dropzoneFile as File).text();
	const parsed = checkFileValidity(datasetText);

	if (parsed.length < 20) {
		logger.error("[uploadDataset] Dataset has less than 20 rows.");
		throw new Error("A dataset should have at least 20 rows.");
	}

	// Write dataset to temporary path
	const fileName = `${uuid()}.json`;
	const localPath = `./tmp/${fileName}`;

	await fs.mkdir("./tmp/").catch(() => {});
	await fs.writeFile(localPath, datasetText);

	// Upload dataset
	await uploadFile(datasetText, fileName).catch((e) => {
		logger.error("[uploadDataset] Could not upload file.", {error: e});
		throw new Error("Could not upload file.");
	});

	// Create new database entry
	const dataset = await createDataset(userId, validatedForm.name, fileName, parsed.length);
	return dataset.id;
}
