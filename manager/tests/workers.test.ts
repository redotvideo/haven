import {afterAll, beforeAll, describe, expect, test} from "@jest/globals";

import * as fs from "fs/promises";
import {setup} from "../lib/setup";
import {runServer} from "../api";
import {telemetryInterval} from "../lib/telemetry";

let close: any = undefined;

// TODO: write the actual tests

describe("Workers", () => {
	beforeAll(async () => {
		// move ./tests/assets/key.json to ./key.json
		await fs.rm("./key.json").catch(() => {});
		await fs.copyFile("./tests/assets/key.json", "./key.json");

		await setup().then(async () => {
			close = await runServer();
		});
	});

	test("Create a new inference worker", () => {});

	test("Create a new inference worker with a name", () => {});

	test("Create a new inference worker with a name that already exists", () => {});

	test("Pause an inference worker", () => {});

	test("Resume an inference worker", () => {});

	test("Delete an inference worker", () => {});

	afterAll(async () => {
		await close();
		clearInterval(telemetryInterval);
	});
});
