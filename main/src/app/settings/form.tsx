"use client";
import {useFormState, useFormStatus} from "react-dom";
import Button from "~/components/form/button";
import TextField from "~/components/form/textfield";
import {submitForm} from "./actions";

export const initialState: {
	message: string | null;
	color: string | null;
} = {
	message: null,
	color: null,
};

function SubmitButton() {
	const {pending} = useFormStatus();

	return (
		<Button type={"submit"} loading={pending}>
			Save
		</Button>
	);
}

export default function SettingsForm({name, hfToken}: {name?: string; hfToken?: string}) {
	const [state, formAction] = useFormState<typeof initialState, FormData>(submitForm, initialState);

	return (
		<form action={formAction}>
			<div className="space-y-12">
				<div className="border-b border-white/10 pb-12">
					<h2 className="text-base font-semibold leading-7 text-white">Account Information</h2>
					<p className="mt-1 text-sm leading-6 text-gray-400">
						Update your account information. This information stays between you and us.
					</p>

					<div className="mt-5">
						<TextField label={"Your name"} placeholder={name ?? "Your name"} type="text" name="name" />
					</div>

					<div className="mt-5">
						<TextField label={"Your Huggingface token"} placeholder={hfToken ?? "hf_"} type="text" name="hf_token" />
					</div>
				</div>
			</div>

			<div className="mt-6 flex items-center justify-end gap-x-6">
				<div className={`${state.color} text-right`}>{state.message}</div>
				<SubmitButton />
			</div>
		</form>
	);
}
