"use client";
import {ChevronDownIcon} from "@heroicons/react/20/solid";
import {useState} from "react";
import {useFormState} from "react-dom";
import Dropdown from "~/components/form/dropdown";
import Label from "~/components/form/label";
import TextField from "~/components/form/textfield";
import {validateAndCalculatePrice} from "./actions";
import ConfirmModal from "./confirm-price";
import SubmitButton from "~/components/form/submit-button";
import Tooltip from "~/components/tooltip";
import Search from "./search";
import {modelsToFinetune} from "~/constants/models";

const initialState: {
	success: boolean;
	priceInCents: number | null;
	userHasEnoughCredits: boolean | null;
	formData: FormData | null;
	message: string | null;
} = {
	success: false,
	priceInCents: null,
	userHasEnoughCredits: null,
	formData: null,
	message: null,
};

export type State = typeof initialState;

const tooltips = {
	modelName: (
		<>What do you want to call your model? The name should be unique and contain only letters, numbers, and dashes.</>
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
	learningRate: (
		<>
			Learning rate controls how much the model gets updated after each batch. In general, the larger the dataset, the
			lower the learning rate should be.
		</>
	),
	numberOfEpochs: (
		<>
			An epoch is one full pass through the dataset. The number of epochs controls how many times the model will see the
			dataset. Usually, a number between 1 and 5 is sufficient.
		</>
	),
	baseModel: (
		<>
			The base model is the model you want to fine-tune. Zephyr is a fine-tuned version of Mistral which we found to be
			very effective for further fine-tuning.
		</>
	),
};

export default function NewModelForm() {
	const [open, setOpen] = useState<boolean>(false);
	const [state, formAction] = useFormState<State, FormData>(validateAndCalculatePrice, initialState);

	function formActionSetOpen(formData: FormData) {
		setOpen(true);
		formAction(formData);
	}

	const [learningRate, setLearningRate] = useState<string>("");
	const [baseModel, setBaseModel] = useState<string>("");

	return (
		<>
			<ConfirmModal state={state} open={open} setOpen={setOpen} />
			<form action={formActionSetOpen}>
				<div className="space-y-12">
					<div className="border-b border-white/10 pb-12">
						<h2 className="text-base font-semibold leading-7 text-white">Create a new fine-tuned LLM</h2>
						<p className="mt-1 text-sm leading-6 text-gray-400">
							If you need help, check out our fine-tuning guide which explains the different parameters. Fine-tuning is
							a very volatile process and usually requires a lot of experimentation.
						</p>

						<div className="mt-5">
							<div className="flex items-center gap-x-2">
								<Label>Model name</Label>
								<Tooltip className="mb-2">{tooltips.modelName}</Tooltip>
							</div>
							<TextField className="max-w-xs" placeholder={"new-model"} type="text" name="name" />
						</div>

						<div className="mt-5">
							<div className="flex items-center gap-x-2">
								<Label>Dataset</Label>
								<Tooltip className="mb-2">{tooltips.dataset}</Tooltip>
							</div>
							<Search />
						</div>

						<div className="mt-5">
							<div className="flex items-center gap-x-2">
								<Label>Learning rate</Label>
								<Tooltip className="mb-2">{tooltips.learningRate}</Tooltip>
							</div>
							<Dropdown options={["Low", "Medium", "High"]} onSelect={(choice) => setLearningRate(choice)}>
								<div className="w-80 flex items-center justify-between gap-x-1 text-gray-500 text-sm leading-6 px-3 py-1.5 rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
									{learningRate ? learningRate : "Choose"}
									<ChevronDownIcon className="h-5 w-5" />
								</div>
							</Dropdown>
						</div>

						{/* Dropown result as hidden field */}
						<input type="text" name="learningRate" value={learningRate} readOnly hidden />

						<div className="mt-5">
							<div className="flex items-center gap-x-2">
								<Label>Number of epochs</Label>
								<Tooltip className="mb-2">{tooltips.numberOfEpochs}</Tooltip>
							</div>
							<TextField
								className="max-w-xs"
								placeholder={"Usually a number from 1 to 5"}
								type="number"
								name="numberOfEpochs"
							/>
						</div>

						<div className="mt-5">
							<div className="flex items-center gap-x-2">
								<Label>Base model</Label>
								<Tooltip className="mb-2">{tooltips.baseModel}</Tooltip>
							</div>
							<Dropdown options={modelsToFinetune} onSelect={(choice) => setBaseModel(choice)}>
								<div className="w-80 flex items-center justify-between gap-x-1 text-gray-500 text-sm leading-6 px-3 py-1.5 rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
									{baseModel ? baseModel : "Choose"}
									<ChevronDownIcon className="h-5 w-5" />
								</div>
							</Dropdown>
						</div>

						{/* Dropown result as hidden field */}
						<input type="text" name="baseModel" value={baseModel} readOnly hidden />
					</div>
				</div>

				<div className="flex items-center mt-6 gap-x-6">
					<SubmitButton>Calculate price</SubmitButton>
					{<div className={`text-red-600 text-right`}>{state.message}</div>}
				</div>
			</form>
		</>
	);
}
