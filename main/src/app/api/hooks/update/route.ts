import * as y from "yup";
import {addWandBUrl, getJobCostInCents, getModelFromId, updateState} from "~/server/database/model";
import {getUserFromId, increaseBalance} from "~/server/database/user";
import {logger} from "~/server/utils/observability/logtail";
import {EventName, sendEvent} from "~/server/utils/observability/posthog";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

const bodySchema = y.object({
	id: y.string().required(),
	key: y.string().oneOf(["wandb", "status"]).required(),
	value: y.string().required(),
});

export async function POST(request: Request) {
	if (request.headers.get("x-secret") !== WEBHOOK_SECRET) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	const body = await request.json();
	const validatedBody = await bodySchema.validate(body);

	const model = await getModelFromId(validatedBody.id);
	if (model == null) {
		throw new Error("Could not find model");
	}

	if (validatedBody.key === "wandb" && validatedBody.id !== "") {
		sendEvent("system", EventName.FINE_TUNE_WANDB_ADDED, {wandbUrl: validatedBody.value, modelId: validatedBody.id});
		await addWandBUrl(validatedBody.id, validatedBody.value);
	}

	if (validatedBody.key === "status") {
		const status = await y.string().oneOf(["finished", "error"]).required().validate(validatedBody.value);

		// Refund
		if (status === "error") {
			const jobPriceInCents = await getJobCostInCents(validatedBody.id);
			const user = await getUserFromId(model.userId);

			if (!user) {
				logger.error("Could not find user", {id: validatedBody.id, userId: model.userId});
				throw new Error("Could not find user");
			}

			if (jobPriceInCents == null) {
				logger.error("Could not find job price", {id: validatedBody.id, userId: model.userId});
				throw new Error("Could not find job price");
			}

			logger.error("Training job failed, refunding cost", {id: validatedBody.id, jobPriceInCents, userId: user.id});
			await increaseBalance(model.userId, jobPriceInCents, `Refund for failed model: ${validatedBody.id}`).catch(
				(e) => {
					logger.error("Could not refund", {id: validatedBody.id, jobPriceInCents, userId: user.id, error: e});
				},
			);
		} else {
			sendEvent(model.userId, status === "finished" ? EventName.FINE_TUNE_FINISHED : EventName.FINE_TUNE_FAILED);
		}

		await updateState(validatedBody.id, status);
	}

	return new Response("OK", {
		status: 200,
	});
}
