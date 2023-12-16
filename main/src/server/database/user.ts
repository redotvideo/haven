import {createHash} from "crypto";
import {db} from ".";

import {v4 as uuid} from "uuid";

export function hash(value: string) {
	return createHash("sha256").update(value).digest("hex");
}

export async function getUserFromId(id: string) {
	return db.user.findUnique({
		where: {
			id,
		},
	});
}

/**
 * Create an api key for a user
 */
export async function addApiKeyToUser(userId: string) {
	const id = uuid();

	await db.user.update({
		where: {
			id: userId,
		},
		data: {
			apiKey: id,
		},
	});

	return id;
}

export async function updateHfToken(userId: string, hfToken: string) {
	await db.user.update({
		where: {
			id: userId,
		},
		data: {
			hfToken,
		},
	});
}

export function updateEmail(_: string, __: string) {
	// Warning for future Konsti: we might need to update the email on the Stripe customer too
	throw new Error("Not implemented");
}

export async function updateName(userId: string, name: string) {
	await db.user.update({
		where: {
			id: userId,
		},
		data: {
			name,
		},
	});
}

/**
 * Add stripe customer id to user.
 */
export async function addStripeCustomerIdAndPaymentMethodToUser(
	id: string,
	stripeCustomerId: string,
	paymentMethodId: string,
) {
	return db.user.update({
		where: {
			id: id,
		},
		data: {
			stripeCustomerId: stripeCustomerId,
			stripePaymentMethodId: paymentMethodId,
		},
	});
}

/**
 * Increments users cents balance by given amount.
 */
export async function increaseBalance(id: string, cents: number, message?: string) {
	// TODO: move to controller
	await db.transaction.create({
		data: {
			userId: id,
			amount: cents,
			reason: message || "Account top-up",
		},
	});

	return db.user.update({
		where: {
			id: id,
		},
		data: {
			centsBalance: {
				increment: cents,
			},
		},
	});
}

/**
 * Decrements users cents balance by given amount.
 */
export async function decreaseBalance(id: string, cents: number, reason: string) {
	// TODO: move to controller
	await db.transaction.create({
		data: {
			userId: id,
			amount: -cents,
			reason,
		},
	});

	return db.user.update({
		where: {
			id: id,
		},
		data: {
			centsBalance: {
				decrement: cents,
			},
		},
	});
}
