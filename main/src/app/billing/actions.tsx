"use server";

import * as y from "yup";

import {revalidatePath} from "next/cache";
import {
	createPaymentIntent,
	createSetupIntent,
	createStripeCustomerAndAttachPaymentMethod,
	getStripeCreditCardInfo,
	validateSetupIntent,
} from "~/server/controller/stripe";
import {addStripeCustomerIdAndPaymentMethodToUser, increaseBalance, updateName} from "~/server/database/user";
import {EventName, sendEvent} from "~/server/utils/observability/posthog";
import {checkSessionAction} from "~/server/utils/session";
import {logger} from "~/server/utils/observability/logtail";

export async function revalidate() {
	return Promise.resolve().then(() => revalidatePath("/billing"));
}

export async function updateAccountName(name: string) {
	y.string().required().validateSync(name);

	const session = await checkSessionAction();
	await updateName(session.user.id, name).catch((e) => {
		logger.error("Error updating name", {error: e});
		throw new Error("Internal server error");
	});
}

export async function getStripePublishableKey() {
	if (process.env.STRIPE_PUBLISHABLE_KEY === undefined) {
		logger.error("Stripe publishable key is not set.");
		throw new Error("Stripe publishable key is not set.");
	}
	return Promise.resolve(process.env.STRIPE_PUBLISHABLE_KEY);
}

export async function getCreditCardInformation() {
	const session = await checkSessionAction();

	if (session.user.stripeCustomerId) {
		return getStripeCreditCardInfo(session.user.stripeCustomerId).catch((e) => {
			logger.error("Error getting stripe credit card info", {error: e});
			throw new Error("Internal server error");
		});
	}
}

export async function createSetupIntentAction(stripeCreditCardId: string) {
	// TODO: validation
	const intent = await createSetupIntent(stripeCreditCardId);
	return intent.client_secret;
}

export async function finalizeCreditCard(stripeCreditCardId: string, stripeSetupIntentClientSecret: string) {
	// TODO: valdation
	const session = await checkSessionAction();
	if (!session.user.email) {
		sendEvent(session.user.id, EventName.EMERGENCY, {
			message: `User email is not set. User id: ${session.user.id}`,
		});
		logger.error("User email is not set.");
		throw new Error("User email is not set.");
	}

	// Validating setup intent
	const setupIntentValid = await validateSetupIntent(stripeSetupIntentClientSecret);
	if (!setupIntentValid) {
		logger.error("Setup intent is invalid", {
			stripeSetupIntentClientSecret,
			stripeCreditCardId,
		});
		sendEvent(session.user.id, EventName.EMERGENCY, {
			message: `Setup intent is invalid. User id: ${session.user.id}, stripeSetupIntentClientSecret: ${stripeSetupIntentClientSecret}, stripeCreditCardId: ${stripeCreditCardId}`,
		});
		throw new Error("Error validating setup intend.");
	}

	// Creating a stripe customer and attaching the payment method
	const stripeCustomer = await createStripeCustomerAndAttachPaymentMethod(
		session.user.name ?? "",
		session.user.email,
		stripeCreditCardId,
		session.user.stripeCustomerId ?? undefined,
	).catch((e) => {
		logger.error("Error creating stripe customer", {
			stripeSetupIntentClientSecret,
			stripeCreditCardId,
			error: e,
		});
		sendEvent(session.user.id, EventName.EMERGENCY, {
			message: `Error creating stripe customer. User id: ${session.user.id}, stripeSetupIntentClientSecret: ${stripeSetupIntentClientSecret}, stripeCreditCardId: ${stripeCreditCardId}`,
			error: (e as Error).message,
		});
		throw new Error("Error creating stripe customer.");
	});

	// Attaching stripe customer id to the databsae user
	await addStripeCustomerIdAndPaymentMethodToUser(session.user.id, stripeCustomer.id, stripeCreditCardId).catch((e) => {
		logger.error("Error adding stripe customer id to user", {
			stripeSetupIntentClientSecret,
			stripeCreditCardId,
			error: e,
		});
		sendEvent(session.user.id, EventName.EMERGENCY, {
			message: `Error adding stripe customer id to user. User id: ${session.user.id}, stripeSetupIntentClientSecret: ${stripeSetupIntentClientSecret}, stripeCreditCardId: ${stripeCreditCardId}`,
			error: (e as Error).message,
		});
		throw new Error("Internal server error.");
	});

	sendEvent(session.user.id, EventName.CREDIT_CARD_ADDED);
}

export async function addBalanceAction(amountInDollars: number) {
	const session = await checkSessionAction();
	if (!session.user.stripeCustomerId || !session.user.stripePaymentMethodId) {
		logger.error("User has no stripe customer id");
		throw new Error("Internal error.");
	}

	if (amountInDollars > 50) {
		logger.error("User is trying to add more than 50 dollars", {amountInDollars});
		throw new Error("Can't add more than $50 at once.");
	}

	if (session.user.centsBalance > 10000) {
		logger.error("User already has more than 100 dollars");
		throw new Error("You can't add more funds when your balance currently exceeds $100.");
	}

	const amountInCents = amountInDollars * 100;

	await createPaymentIntent(
		session.user.stripeCustomerId,
		session.user.stripePaymentMethodId,
		amountInCents,
		"Haven Account Top Up",
	).catch((e) => {
		logger.error("Error creating off session payment intent", {error: e});
		sendEvent(session.user.id, EventName.EMERGENCY, {message: "User couldn't add balance", amount: amountInCents});
		throw new Error("Error charging credit card. If this persists, send us an email at hello@haven.run.");
	});

	await increaseBalance(session.user.id, amountInCents).catch((e) => {
		logger.error("Error increasing balance", {error: e});
		sendEvent(session.user.id, EventName.EMERGENCY, {
			message: "User charged but balance not increased.",
			amount: amountInCents,
		});
		throw new Error("Internal server error.");
	});

	sendEvent(session.user.id, EventName.MONEY_ADDED, {amount: amountInCents});
}
