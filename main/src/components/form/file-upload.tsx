import {ArrowUpTrayIcon} from "@heroicons/react/20/solid";
import React, {useState} from "react";

interface Props {
	onFile: (file: File) => void;
}

export default function FileUpload({onFile}: Props) {
	const [file, setFile] = useState<File | undefined>();
	const [dragging, setDragging] = useState<boolean>(false);

	function setDraggingWithoutDefault(e: React.DragEvent<HTMLLabelElement>, value: boolean) {
		e.preventDefault();
		e.stopPropagation();
		setDragging(value);
	}

	function fileAdded(newFile: File) {
		onFile(newFile);
		setFile(newFile);
	}

	function onDrop(e: React.DragEvent<HTMLLabelElement>) {
		e.preventDefault();
		e.stopPropagation();

		const files = e.dataTransfer.files;

		if (files.length > 0) {
			fileAdded(files[0]!);
		}
	}

	function onFileChangeInternal(e: React.ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;

		if (files?.[0]) {
			fileAdded(files[0]);
		}
	}

	const draggingType = "bg-gray-950";
	const droppedType = "bg-gray-950";
	const styles = dragging ? (file ? droppedType : draggingType) : "";

	return (
		<div className="flex items-center justify-center w-full">
			<label
				htmlFor="dropzone-file"
				className={`flex flex-col items-center justify-center w-full h-40 border border-gray-900/25 border-dashed rounded-lg cursor-pointer bg-background-raised dark:hover:bg-highlighted-dark dark:bg-background-raised-dark hover:bg-gray-950 dark:border-gray-600 dark:hover:border-gray-500 ${styles}`}
				onDragOver={(e) => setDraggingWithoutDefault(e, true)}
				onDragLeave={(e) => setDraggingWithoutDefault(e, false)}
				onDrop={onDrop}
			>
				<div className="flex flex-col items-center justify-center pt-1">
					<ArrowUpTrayIcon className="mb-4 mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
					{file === undefined ? (
						<React.Fragment>
							<p className="mb-2 text-sm">
								<span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
							</p>
							<p className="text-xs">Dataset File in OpenAI Format. (.jsonl)</p>
						</React.Fragment>
					) : (
						<React.Fragment>
							<p className="mb-2 text-sm">
								Selected File: <span className="font-semibold">{file.name}</span>
							</p>
							<p className="text-xs">Click or drag and drop to change file.</p>
						</React.Fragment>
					)}
				</div>
				<input id="dropzone-file" type="file" className="hidden" onChange={onFileChangeInternal} />
			</label>
		</div>
	);
}
