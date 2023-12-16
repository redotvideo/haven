import * as y from "yup";
import {Transition} from "@headlessui/react";
import {MagnifyingGlassIcon, PlusIcon} from "@heroicons/react/20/solid";
import {ArrowPathIcon, CheckIcon} from "@heroicons/react/24/outline";
import {Fragment, useState} from "react";

import type {SearchResponse} from "~/app/api/search/route";
import NewDatasetModal from "~/app/datasets/new/modal";

export default function Search() {
	const [loading, setLoading] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const [value, setValue] = useState<string>("");
	const [searchResponse, setSerachResponse] = useState<SearchResponse>([]);
	const [selected, setSelected] = useState<string | null>(null);

	const [uploadDatasetModelOpen, setUploadDatasetModelOpen] = useState<boolean>(false);
	function setUploadDatasetModelOpenWrapper(open: boolean, datasetId?: string, datasetName?: string) {
		setUploadDatasetModelOpen(open);
		if (datasetId && datasetName) {
			setSelected(datasetId);
			setValue(datasetName);
			setOpen(false);
		}
	}

	async function fetchSearchResults() {
		setLoading(true);
		const results = await fetch("/api/search", {
			method: "POST",
			body: JSON.stringify({query: value}),
		});

		const schema = y
			.array(
				y
					.object({
						id: y.string().required(),
						name: y.string().required(),
						rows: y.number().required(),
					})
					.required(),
			)
			.required();

		const json = await results.json();
		const validated = await schema.validate(json);

		setSerachResponse(validated);
		setLoading(false);
	}

	async function onOpenChange(open: boolean) {
		setOpen(open);

		if (open && searchResponse.length === 0) {
			await fetchSearchResults();
		}
	}

	async function onValueChange(value: string) {
		setValue(value);
		await fetchSearchResults();
	}

	function onSelectedChange(id: string, name: string) {
		setSelected(id);
		setValue(name);
		setOpen(false);
	}

	return (
		<>
			<NewDatasetModal open={uploadDatasetModelOpen} setOpen={setUploadDatasetModelOpenWrapper} />
			<div className="relative">
				<div className="max-w-xs flex items-center justify-between rounded-md bg-white/5 ring-1 ring-inset ring-white/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
					<div className="flex items-center">
						<MagnifyingGlassIcon className="ml-3 h-4 w-4 text-gray-500" />
						<input
							type={"text"}
							className="flex-1 border-0 bg-transparent py-1.5 pl-2 text-white focus:ring-0 sm:text-sm sm:leading-6"
							placeholder={"Search"}
							value={value}
							onChange={(e) => onValueChange(e.target.value)}
							onFocus={() => onOpenChange(true)}
							onBlur={() => onOpenChange(false)}
						/>
					</div>
					{loading && (
						<div className="animate-spin mr-3">
							<ArrowPathIcon className="h-4 w-4 text-gray-500" />
						</div>
					)}
					{selected && <CheckIcon className="mr-3 h-4 w-4 text-green-500" />}
				</div>
				<Transition
					as={Fragment}
					show={open}
					enter="transition ease-out duration-100"
					enterFrom="transform opacity-0 scale-95"
					enterTo="transform opacity-100 scale-100"
					leave="transition ease-in duration-75"
					leaveFrom="transform opacity-100 scale-100"
					leaveTo="transform opacity-0 scale-95"
				>
					<div className="absolute left-0 z-10 mt-2 origin-top-right rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						<div className="rounded-md border border-gray-800">
							<div
								onClick={() => setUploadDatasetModelOpen(true)}
								className={`cursor-pointer flex items-center w-full px-3 py-2 hover:bg-gray-100 hover:dark:bg-gray-900 ${
									searchResponse.length > 0 && "border-b-2"
								}`}
							>
								<PlusIcon className="h-5 w-5 text-gray-400" />
								<div className="text-gray-400 text-sm">upload new dataset</div>
							</div>
							{searchResponse.map((option, index) => (
								<div
									onClick={() => onSelectedChange(option.id, option.name)}
									key={index}
									className="cursor-pointer flex items-center hover:bg-gray-100 hover:dark:bg-gray-900"
								>
									<div className="px-4 py-2 text-sm ">{option.name}</div>
									<div className="text-sm text-gray-400 pr-4">{`${option.rows} rows`}</div>
								</div>
							))}
						</div>
					</div>
				</Transition>
			</div>
			{/* Hidden input containing the datasetId */}
			<input type="text" name="datasetId" value={selected || ""} readOnly hidden />
		</>
	);
}
