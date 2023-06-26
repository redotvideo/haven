import * as fs from "fs/promises";

export interface ModelFile {
	architecture: string;
	name: string;
	tokenizer: string;
	instructionPrefix: string;
	outputPrefix: string;
	stopTokens: string[];
}

/**
 * @returns A list of all available models.
 */
export async function getAllModels() {
	const files = await fs.readdir("./config/models");
	return files.map((file) => file.replace(".json", ""));
}

async function findModelFile(model: string) {
	const files = await fs.readdir("./config/models");

	// Slow...
	for (const file of files) {
		const text = await fs.readFile(`./config/models/${file}`, "utf-8");

		// TODO(konsti): Validation
		const parsed = JSON.parse(text) as ModelFile;

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
