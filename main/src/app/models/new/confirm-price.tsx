import Modal from "~/components/modal";
import {useFormState} from "react-dom";
import {revalidate, startNewTraining} from "./actions";
import SubmitButton from "~/components/form/submit-button";
import {useRouter} from "next/navigation";

import type {State} from "./form";

export default function ConfirmModal({
	state,
	open,
	setOpen,
}: {
	state: State;
	open: boolean;
	setOpen: (state: boolean) => void;
}) {
	const [newState, formAction] = useFormState<State, FormData>(startNewTraining, state);

	const router = useRouter();

	if (newState.success) {
		void revalidate().then(() => router.push("/models"));
	}

	function formActionWrapper(_: FormData) {
		if (!state.priceInCents || !state.formData) {
			// TODO: handle
			return;
		}

		(state.formData as any as string[][]).push(["confirmedPrice", state.priceInCents.toString()]);
		formAction(state.formData);
	}

	return (
		<Modal open={state.priceInCents !== null && open} setOpen={setOpen}>
			<div className="text-md">Cost for this run</div>
			<div className="mt-2 text-xs text-gray-400">
				Refer{" "}
				<a className="underline" href="https://app.haven.run">
					to our docs
				</a>{" "}
				for our pricing calculation.
			</div>
			<div
				className={`mt-2 text-4xl font-semibold ${state.userHasEnoughCredits ? "text-gray-200" : "text-red-600"}`}
			>{`$${((state.priceInCents || 0) / 100).toFixed(2)}`}</div>
			{state.userHasEnoughCredits ? (
				<>
					<div className="mt-2 text-xs text-gray-400">
						The fine-tuning process will start and this amount will be deducted from your balance once you click
						&quot;Confirm and start&quot;.
					</div>
					<div className="mt-2 text-xs text-gray-400">
						If the training process stops due to a an internal error, your credits will be reimbursed.
					</div>
				</>
			) : (
				<div className="mt-2 text-xs text-red-600">
					{"You don't have enough balance left. Please first add more balance to your account."}
				</div>
			)}

			{newState.message && <div className="mt-4 text-xs font-semibold text-red-600">{newState.message}</div>}
			{state.userHasEnoughCredits && (
				<form action={formActionWrapper}>
					<SubmitButton className="mt-4">Confirm and start</SubmitButton>
				</form>
			)}
		</Modal>
	);
}
