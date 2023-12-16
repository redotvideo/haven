import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

/**
 * How setting up a payment method with Stripe works:
 *
 * 1. Client sends credit card info to Stripe
 * 2. Stripe returns a payment method ID
 * 3. Client sends payment method ID to server
 * 4. Server creates a Setup Intent with the payment method ID
 * 5. Server returns the client secret of the setup intent to the client
 * 6. Client uses the client secret to authenticate the payment method, sometimes with 3D secure
 * 7. Client sends the payment method ID and intent id back to the server, confirming that the payment method is authenticated
 * 8. Server validates that the payment method is authenticated
 * 9. Server creates a Stripe customer with the payment method ID
 */

const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2023-10-16",
	appInfo: {
		name: "Haven NextJS",
		version: "0.0.1",
	},
});

/**
 * Step 4 of setting up a payment method with Stripe
 */
export async function createSetupIntent(paymentMethodId: string) {
	return stripe.setupIntents.create({
		payment_method: paymentMethodId,
	});
}

/**
 * Step 8.
 */
export async function validateSetupIntent(setupIntentClientSecret: string) {
	const setupIntentId = setupIntentClientSecret.split("_secret")[0];
	if (!setupIntentId) {
		throw new Error("Invalid setup intent secret");
	}

	const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
	return setupIntent && setupIntent.status === "succeeded";
}

/**
 * Step 9.
 */
export async function createStripeCustomerAndAttachPaymentMethod(
	name: string,
	email: string,
	paymentMethodId: string,
	customerId?: string,
) {
	let customer: Stripe.Response<Stripe.Customer>;

	if (customerId) {
		const existingCustomer = await stripe.customers.retrieve(customerId);

		// TODO: We should automatically recover from this at some point.
		if (!existingCustomer || existingCustomer.deleted) {
			throw new Error("Customer used to exist but was deleted.");
		}

		customer = existingCustomer;
	} else {
		customer = await stripe.customers.create({
			name,
			email,
		});
	}

	await stripe.paymentMethods.attach(paymentMethodId, {customer: customer.id});

	return customer;
}

export async function getStripeCreditCardInfo(customerId: string) {
	const customer = await stripe.customers.retrieve(customerId);
	if (!customer || customer.deleted) {
		throw new Error("Stripe customer not found");
	}

	// Get payment methods of customer
	const paymentMethods = await stripe.paymentMethods.list({
		customer: customerId,
		type: "card",
	});

	// TODO: verify that the first payment method is a card
	if (!paymentMethods.data[0]) {
		throw new Error("No payment methods found");
	}

	const card = paymentMethods.data[0].card!;

	return {
		last4: card.last4,
		expiry: `${card.exp_month}/${card.exp_year}`,
	};
}

export function createPaymentIntent(customerId: string, paymentMethodId: string, amount: number, description: string) {
	return stripe.paymentIntents.create({
		customer: customerId,
		amount,
		currency: "usd",
		description,
		off_session: true,
		confirm: true,
		payment_method: paymentMethodId,
	});
}
