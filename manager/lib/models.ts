import * as fs from "fs/promises";
import typia from "typia";
import {Model} from "../api/pb/manager_pb";

// TODO(now): add stop tokens to generate call

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

async function findModelFile(model: string) {
	const files = await fs.readdir("./config/models");

	// Slow...
	for (const file of files) {
		const text = await fs.readFile(`./config/models/${file}`, "utf-8");

		const configValid = typia.createAssertEquals<Model>();
		const parsed = configValid(JSON.parse(text));

		if (parsed.name === model) {
			return parsed;
		}
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
