import * as fs from "fs/promises";
import typia from "typia";
import {Model} from "../api/pb/manager_pb";

type RequiredFieldsOnly<T> = {
	[K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

type ModelBase = RequiredFieldsOnly<Model>;
type ModelAll = Required<Model>;

// Make sure a model file has either none or all optional fields
export type ModelFile = ModelBase | ModelAll;

async function getModelsFromFolder(folder: string): Promise<Model[]> {
	const files = await fs.readdir(folder);
	const filtered = files.filter((file) => file.includes("."));

	const models = filtered.map(async (file) => {
		const text = await fs.readFile(`${folder}/${file}`, "utf-8");
		return typia.createAssertEquals<Model>()(JSON.parse(text));
	});

	return Promise.all(models);
}

/**
 * @returns A list of all available models.
 */
export async function getAllModels(): Promise<Model[]> {
	const havenModels = await getModelsFromFolder("./config/models");
	const customModels = await getModelsFromFolder("./config/models/custom");

	return Promise.all([...havenModels, ...customModels]);
}

/**
 * Finds the model file for the given model name.
 */
async function findModelFile(
	model: string,
	customOnly: boolean,
): Promise<{path: string; model: ModelFile} | undefined> {
	async function checkFile(file: string) {
		const text = await fs.readFile(file, "utf-8");

		const configValid = typia.createAssertEquals<Model>();
		const parsed = configValid(JSON.parse(text));

		console.log(parsed.name, model);

		if (parsed.name === model) {
			return {path: file, model: parsed};
		}
	}

	// Check custom models
	const custom = await fs.readdir("./config/models/custom");

	const customResults = await Promise.all(custom.map((file) => checkFile(`./config/models/custom/${file}`)));
	const customFound = customResults.find((result) => result !== undefined);

	console.log(customResults);

	if (customFound) {
		return {path: customFound.path, model: customFound.model};
	}

	if (customOnly) {
		return;
	}

	// Check Haven models
	const files = await fs.readdir("./config/models");
	const filtered = files.filter((file) => file.includes("."));

	const results = await Promise.all(filtered.map((file) => checkFile(`./config/models/${file}`)));
	const found = results.find((result) => result !== undefined);

	if (found) {
		return {path: `./config/models/${found.path}.json`, model: found.model};
	}
}

/**
 *
 * @param model of the form `@huggingface/${string}`
 * @returns
 */
export async function getModelFile(model: string, customOnly: boolean = false) {
	const file = await findModelFile(model, customOnly);

	if (!file) {
		throw new Error(
			`Model ${model} not supported. Check the docs at https://docs.haven.run to see how to add a new model.`,
		);
	}

	return file;
}
