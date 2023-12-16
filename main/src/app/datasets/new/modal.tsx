"use client";
import {XMarkIcon} from "@heroicons/react/20/solid";
import NewDatasetForm from "./form";
import Modal from "~/components/modal";
import {Dialog} from "@headlessui/react";

export default function NewDatasetModal({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean, datasetId?: string, datasetName?: string) => void;
}) {
	return (
		<Modal open={open} setOpen={setOpen}>
			<button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
				<XMarkIcon className="h-5 w-5" />
			</button>
			<Dialog.Title as="h3" className="text-base font-semibold leading-6">
				Upload dataset
			</Dialog.Title>
			<NewDatasetForm setModalOpen={setOpen} />
		</Modal>
	);
}
