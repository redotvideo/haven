import {checkSession} from "~/server/utils/session";
import Billing from "./billing";
import {getCreditCardInformation, getStripePublishableKey} from "./actions";

export default async function Page() {
	const [session, creditCardInformation, stripePublishableKey] = [
		await checkSession(),
		await getCreditCardInformation(),
		await getStripePublishableKey(),
	];
	const balance = "$" + (session.user.centsBalance / 100).toFixed(2);

	return (
		<>
			<Billing
				balance={balance}
				creditCardInformation={creditCardInformation}
				stripePublishableKey={stripePublishableKey}
			/>
		</>
	);
}
