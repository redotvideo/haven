import * as fs from "fs/promises";

interface ModelFile {
	name: string;
	architecture: string;
}

/**
 * @returns A list of all available models.
 */
export async function getAllModels() {
	const files = await fs.readdir("./config/models");
	return files.map((file) => file.replace(".json", ""));
}

export async function getModelArchitecture(model: string) {
	const modelFile = await fs.readFile(`./config/models/${model}.json`, "utf-8");

	// TODO(konsti): Validation
	const parsed = JSON.parse(modelFile) as ModelFile;

	return parsed.architecture;
}
