import {afterAll, beforeAll, describe, expect, jest, test} from "@jest/globals";

import * as fs from "fs/promises";
import {runServer} from "../api/index";
import {telemetryInterval} from "../lib/telemetry";
import {setup} from "../lib/setup";
import {createClient} from "./helpers/client";
import {Code, ConnectError} from "@bufbuild/connect";
import axios from "axios";

const client = createClient("insecure");
let close: any = undefined;

describe("Setup", () => {
	beforeAll(async () => {
		await fs.rm("./key.json").catch(() => {});

		await setup().then(async () => {
			close = await runServer();
		});
	});

	test("Call setup endpoint when not set up as ping", async () => {
		const res = await client.setup({});
		expect(res.message).toBe(undefined);
	});

	test("Don't accept requests when not set up", async () => {
		const res = await client.listModels({}).catch((e: ConnectError) => {
			return e;
		});

		expect(res.constructor.name).toBe("ConnectError");
		expect((res as ConnectError).code).toBe(Code.FailedPrecondition);
	});

	test("Accept requests when set up", async () => {
		const setupRes = await client.setup({keyFile: (await fs.readFile("./tests/assets/key.json")).toString("utf-8")});
		expect(setupRes.message).toBe(undefined);

		// Expect this not to throw
		await client.listModels({});
	});

	/**
	 * Version warnings
	 */

	test("Call setup endpoint as ping, no version warning", async () => {
		const mock = jest.spyOn(axios, "post");
		mock.mockResolvedValue({data: {}});

		const res = await client.setup({});
		expect(res.message).toBe(undefined);

		mock.mockRestore();
	});

	test("Call setup endpoint as ping, version warning", async () => {
		const mock = jest.spyOn(axios, "post");
		mock.mockResolvedValue({data: {message: "warning"}});

		const res = await client.setup({});
		expect(res.message).toBe("warning");

		mock.mockRestore();
	});

	afterAll(async () => {
		await close();
		clearInterval(telemetryInterval);
	});
});
