import {useState} from "react";
import {Dialog} from "@headlessui/react";
import Button from "../../components/form/button";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {XMarkIcon} from "@heroicons/react/20/solid";
import Modal from "../../components/modal";
import {createSetupIntentAction, finalizeCreditCard, updateAccountName} from "./actions";
import TextField from "~/components/form/textfield";
import Label from "~/components/form/label";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function AddCreditCard({open, setOpen}: Props) {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const [name, setName] = useState<string>("");

	const elements = useElements()!;
	const stripe = useStripe()!;

	async function addCreditCard() {
		setLoading(true);

		const cardElement = elements.getElement(CardElement);

		await updateAccountName(name);

		const {error, paymentMethod} = await stripe.createPaymentMethod({
			type: "card",
			card: cardElement!,
		});

		if (error) {
			setError("Failed to add credit card. Please try a different card or try again later.");
			setLoading(false);
			return;
		}

		const clientSecret = await createSetupIntentAction(paymentMethod.id);
		if (!clientSecret) {
			setError("Failed to add credit card. Please try a different card or try again later.");
			setLoading(false);
			return;
		}

		const confirmationResult = await stripe.confirmCardSetup(clientSecret);
		if (confirmationResult.error) {
			setError("Failed to add credit card. Please try a different card or try again later.");
			setLoading(false);
			return;
		}

		await finalizeCreditCard(paymentMethod.id, clientSecret);

		setError("");
		setLoading(false);
		setOpen(false);
	}

	return (
		<Modal open={open} setOpen={setOpen}>
			<div>
				<div className="text-center">
					<Dialog.Title as="h3" className="text-base font-semibold leading-6">
						Add a credit card
					</Dialog.Title>
					<button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
						<XMarkIcon className="h-5 w-5" />
					</button>
				</div>
				<div className="mt-4 text-sm text-gray-500">
					{"We won't charge your card until you add balance to your account manually."}
				</div>
				<div className="mt-4">
					<TextField label="Name" value={name} onChange={setName} />
				</div>
				<div className="mt-4">
					<Label>Credit card</Label>
					<div className="rounded-md px-2 py-2.5 bg-white/5 border border-white/10">
						<CardElement options={{style: {base: {color: "white"}}}} />
					</div>
				</div>
				<div className="text-red-500 font-medium text-sm">{error}</div>
			</div>
			<div className="mt-4 sm:mt-7">
				<Button onClick={() => addCreditCard()} className="w-full justify-center" loading={loading}>
					Verify and add
				</Button>
			</div>
			<div className="text-xs text-gray-400 mt-2 text-right">
				Powered by{" "}
				<a href="https://stripe.com" className="underline">
					Stripe
				</a>
			</div>
		</Modal>
	);
}
