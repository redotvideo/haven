import {PostHog} from "posthog-node";

const client = new PostHog("phc_YpKoFD7smPe4SXRtVyMW766uP9AjUwnuRJ8hh2EJcVv", {host: "https://eu.posthog.com"});

export enum EventName {
	NEW_USER = "new-user",

	CREDIT_CARD_ADDED = "credit-card-added",
	MONEY_ADDED = "money-added",

	FINE_TUNE_PRICE_CALCULATED = "fine-tune-price-calculated",
	FINE_TUNE_STARTED = "fine-tune-started",
	FINE_TUNE_FINISHED = "fine-tune-finished",
	FINE_TUNE_FAILED = "fine-tune-failed",
	FINE_TUNE_WANDB_ADDED = "fine-tune-wandb-added",

	INFERENCE_REQUEST = "inference-request",

	EMERGENCY = "emergency",
}

export function sendEvent(userId: string, eventName: EventName, eventProperties: object = {}) {
	if (process.env.LOGTAIL_ENV !== "production") {
		return;
	}

	try {
		client.capture({
			distinctId: userId,
			event: eventName,
			properties: eventProperties,
		});
	} catch (e) {
		console.error(e);
	}
}
