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

/**
 * @returns A list of all available models.
 */
export async function getAllModels(): Promise<Model[]> {
	const files = await fs.readdir("./config/models");
	const filtered = files.filter((file) => file.includes("."));

	const havenModels = filtered.map(async (file) => {
		const text = await fs.readFile(`./config/models/${file}`, "utf-8");
		return typia.createAssertEquals<Model>()(JSON.parse(text));
	});

	const custom = await fs.readdir("./config/models/custom");

	const customModels = custom.map(async (file) => {
		const text = await fs.readFile(`./config/models/custom/${file}`, "utf-8");
		return typia.createAssertEquals<Model>()(JSON.parse(text));
	});

	return Promise.all([...havenModels, ...customModels]);
}

/**
 * Finds the model file for the given model name.
 */
async function findModelFile(model: string) {
	async function checkFile(file: string) {
		const text = await fs.readFile(file, "utf-8");

		const configValid = typia.createAssertEquals<Model>();
		const parsed = configValid(JSON.parse(text));

		if (parsed.name === model) {
			return parsed;
		}
	}

	// Check Haven models
	const files = await fs.readdir("./config/models");
	const filtered = files.filter((file) => file.includes("."));

	const results = await Promise.all(filtered.map((file) => checkFile(`./config/models/${file}`)));
	const found = results.find((result) => result !== undefined);

	if (found) {
		return found;
	}

	// Check custom models
	const custom = await fs.readdir("./config/models/custom");

	for (const file of custom) {
		const result = await checkFile(`./config/models/custom/${file}`);
		if (result) {
			return result;
		}
	}

	const customResults = await Promise.all(custom.map((file) => checkFile(`./config/models/custom/${file}`)));
	const customFound = customResults.find((result) => result !== undefined);

	if (customFound) {
		return customFound;
	}
}

/**
 *
 * @param model of the form `@huggingface/${string}`
 * @returns
 */
export async function getModelFile(model: string) {
	const file = await findModelFile(model);

	if (!file) {
		throw new Error(`Model ${model} not supported. Feel free to open an issue on GitHub.`);
	}

	return file;
}
