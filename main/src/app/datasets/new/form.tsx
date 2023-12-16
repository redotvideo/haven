"use client";
import {useFormState} from "react-dom";
import Label from "~/components/form/label";
import TextField from "~/components/form/textfield";
import SubmitButton from "~/components/form/submit-button";
import Tooltip from "~/components/tooltip";
import {UploadIcon} from "lucide-react";
import {uploadDatasetAction} from "./actions";

const initialState: {
	datasetId?: string;
	datasetName?: string;
	message?: string;
} = {
	datasetId: undefined,
	datasetName: undefined,
	message: undefined,
};

export type State = typeof initialState;

const tooltips = {
	datasetName: (
		<>What do you want to call your dataset? The name should be unique and contain only letters, numbers, and dashes.</>
	),
	dataset: (
		<>
			The dataset you want to use for fine-tuning. The dataset should be in{" "}
			<a href="https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset" className="underline">
				this format
			</a>
			. We recommend using a dataset with at least 100 conversations.
		</>
	),
};

export default function NewDatasetForm({
	setModalOpen,
}: {
	setModalOpen: (open: boolean, datasetId?: string, datasetName?: string) => void;
}) {
	const [state, formAction] = useFormState<State, FormData>(uploadDatasetAction, initialState);

	if (state.datasetId) {
		setModalOpen(false, state.datasetId, state.datasetName || undefined);
	}

	return (
		<>
			<form action={formAction}>
				<div className="pb-6">
					<p className="mt-1 text-sm leading-6 text-gray-400">
						Learn more about the dataset format{" "}
						<a href="https://docs.haven.run/finetuning/dataset-format" className="underline">
							here.
						</a>
					</p>

					<div className="mt-5">
						<div className="flex items-center gap-x-2">
							<Label>Dataset name</Label>
							<Tooltip className="mb-2">{tooltips.datasetName}</Tooltip>
						</div>
						<TextField placeholder={"new-dataset"} type="text" name="name" />
					</div>

					<div className="mt-5">
						<div className="flex items-center gap-x-2">
							<Label>Upload file</Label>
							<Tooltip className="mb-2">{tooltips.dataset}</Tooltip>
						</div>
						{/* TODO: re-enable dropzone */}
						<input
							type="file"
							name="dropzoneFile"
							className="block w-full text-sm font text-gray-500 file:mr-4 file:rounded-md file:py-1.5 file:px-2.5 file:bg-gray-900 file:hover:bg-gray-800 file:cursor-pointer file:text-gray-200 file:border file:border-solid file:border-gray-600"
						/>
					</div>
				</div>

				<div>
					{<div className={`text-center text-red-500 mb-2`}>{state.message}</div>}
					<SubmitButton className="w-full justify-center">
						<UploadIcon className="h-4 w-4" />
						Upload
					</SubmitButton>
				</div>
			</form>
		</>
	);
}
