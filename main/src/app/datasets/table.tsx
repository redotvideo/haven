"use client";
import {PlusIcon} from "@heroicons/react/20/solid";
import Button from "~/components/form/button";
import {useState} from "react";
import NewDatasetModal from "./new/modal";

import type {DatasetTableProps} from "./page";

export default function DatasetTable({datasets}: {datasets: DatasetTableProps}) {
	const [newDatasetModalOpen, setNewDatasetModalOpen] = useState(false);

	function NewModelButton() {
		return (
			<Button className="gap-x-1" onClick={() => setNewDatasetModalOpen(true)}>
				<PlusIcon className="h-4 w-4" />
				Add new dataset
			</Button>
		);
	}

	return (
		<>
			<NewDatasetModal open={newDatasetModalOpen} setOpen={setNewDatasetModalOpen} />
			<div className="mt-4 px-4 sm:px-6 lg:px-8">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<p className="mt-2 text-sm text-gray-300">
							You can create and manage your datasets here. Learn more about the dataset format{" "}
							<a href="https://docs.haven.run/finetuning/dataset-format" className="font-medium underline">
								in our docs.
							</a>
						</p>
					</div>
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<NewModelButton />
					</div>
				</div>
				<div className="mt-8 flow-root">
					<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
							<table className="min-w-full divide-y divide-gray-800">
								<thead className="text-gray-300">
									<tr>
										<th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
											Name
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
											Rows
										</th>
										<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
											Created
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-900">
									{datasets.map((dataset) => (
										<tr key={dataset.id} className="text-gray-500">
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-0">
												{dataset.name}
											</td>
											{/*<td className="whitespace-nowrap px-3 py-4 text-sm">{dataset.description}</td>*/}
											<td className="whitespace-nowrap px-3 py-4 text-sm">{dataset.rows}</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm">{dataset.created}</td>
											{/*
											<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
												<a href="#" className="text-gray-100 underline">
													View<span className="sr-only">, {dataset.name}</span>
												</a>
											</td>
									*/}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
