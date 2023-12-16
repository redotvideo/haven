import {Dialog} from "@headlessui/react";
import {useFormState} from "react-dom";
import Label from "~/components/form/label";
import TextField from "~/components/form/textfield";
import Modal from "~/components/modal";
import Tooltip from "~/components/tooltip";
import {exportModel} from "./actions";
import {XMarkIcon} from "@heroicons/react/20/solid";
import SubmitButton from "~/components/form/submit-button";

export interface State {
	success: boolean;
	error: string;
}

const initialState: State = {
	success: false,
	error: "",
};

const tooltipContent = (
	<>
		Your Huggingface token is used to upload the model to your account. You can find your token{" "}
		<a href="https://huggingface.co/settings/token" className="underline">
			here
		</a>
		.
	</>
);

export default function ExportModal({
	open,
	setOpen,
	modelId,
	hfToken,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	modelId: string;
	hfToken?: string;
}) {
	const [state, formAction] = useFormState<State, FormData>(exportModel, initialState);

	return (
		<Modal open={open} setOpen={setOpen}>
			<form action={formAction}>
				<button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
					<XMarkIcon className="h-5 w-5" />
				</button>
				<Dialog.Title as="h3" className="text-base font-semibold leading-6">
					Export to Huggingface
				</Dialog.Title>
				<div className="my-4 text-sm text-gray-400">
					Export the selected model to Huggingface. The repository will include instructions on how to use the model.
				</div>
				<div className="flex items-center gap-x-2">
					<Label>Huggingface token</Label>
					<Tooltip className="pb-2">{tooltipContent}</Tooltip>
				</div>
				<TextField placeholder="hf_" type="text" name="hfToken" defaultValue={hfToken} />
				<TextField
					label="Huggingface namespace"
					placeholder="Your Huggingface name or organization"
					type="text"
					name="namespace"
				/>
				<TextField label="Repository name" placeholder="What do you want to call the model?" type="text" name="name" />

				{/* Hidden field for model id */}
				<input type="text" name="modelId" value={modelId} readOnly hidden />

				{state.error && (
					<div className={`font-medium text-sm ${state.success ? "text-green-500" : "text-red-500"}`}>
						{state.error}
					</div>
				)}
				{!state.success && <SubmitButton className="w-full justify-center mt-4">Export</SubmitButton>}
			</form>
		</Modal>
	);
}
