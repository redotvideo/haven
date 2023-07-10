import {afterAll, beforeAll, describe, expect, test} from "@jest/globals";

import * as fs from "fs/promises";
import {setup} from "../lib/setup";
import {runServer} from "../api";
import {telemetryInterval} from "../lib/telemetry";
import {createClient} from "./helpers/client";
import {Code, ConnectError} from "@bufbuild/connect";

const client = createClient("insecure");
let close: any = undefined;

describe("Models", () => {
	beforeAll(async () => {
		// move ./tests/assets/key.json to ./key.json
		await fs.rm("./key.json").catch(() => {});
		await fs.rmdir("./config/models/custom/", {recursive: true}).catch(() => {});

		await fs.copyFile("./tests/assets/key.json", "./key.json");

		await setup().then(async () => {
			close = await runServer();
		});
	});

	test("list models", async () => {
		const models = await client.listModels({});
		const modelCount = models.models.length;

		expect(modelCount).toBeGreaterThan(1);
	});

	test("add model and list models", async () => {
		const initialModels = await client.listModels({});
		const modelCount = initialModels.models.length;

		expect(modelCount).toBeGreaterThan(1);

		await client.addModel({
			architecture: "mpt_7b",
			name: "@huggingface/test",
			tokenizer: "wrong",
		});

		const models = await client.listModels({});
		expect(models.models.length).toBe(modelCount + 1);
	});

	test("add model with only some of the optional parameter", async () => {
		const initialModels = await client.listModels({});
		const modelCount = initialModels.models.length;

		expect(modelCount).toBeGreaterThan(1);

		await client
			.addModel({
				architecture: "mpt_7b",
				name: "@huggingface/test-2",
				tokenizer: "wrong",
				systemPrompt: "test",
			})
			.catch((e: ConnectError) => {
				console.log("HEREE");
				expect(e.code).toBe(Code.InvalidArgument);
			});
	});

	test("delete model", async () => {
		const initialModels = await client.listModels({});
		const modelCount = initialModels.models.length;

		expect(modelCount).toBeGreaterThan(1);

		await client.addModel({
			architecture: "mpt_7b",
			name: "@huggingface/test-3",
			tokenizer: "wrong",
		});

		const models = await client.listModels({});
		expect(models.models.length).toBe(modelCount + 1);

		await client.deleteModel({name: "@huggingface/test-3"});

		const models2 = await client.listModels({});
		expect(models2.models.length).toBe(modelCount);
	});

	afterAll(async () => {
		await close();
		clearInterval(telemetryInterval);
	});
});
