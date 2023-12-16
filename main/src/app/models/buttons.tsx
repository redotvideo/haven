"use client";
import {ChatBubbleBottomCenterIcon, EllipsisVerticalIcon} from "@heroicons/react/20/solid";
import {ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import {Loader2Icon} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react";
import Button from "~/components/form/button";
import Dropdown from "~/components/form/dropdown";
import ExportModal from "./export";

export default function Buttons({
	modelId,
	state,
	wandbUrl,
	hfToken,
}: {
	modelId: string;
	state: "training" | "finished" | "error" | "online";
	wandbUrl?: string;
	hfToken?: string;
}) {
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);

	/**
	 * Process dropdown item selection
	 */
	function selectItem(item: string, modelId: string, wandbUrl?: string) {
		if (item === "Logs" && wandbUrl) {
			window.open(wandbUrl);
		}

		if (item === "Export") {
			setIsExportModalOpen(true);
		}
	}

	const wandbButton = (
		<a href={wandbUrl}>
			<Button>
				<Image src="/wandblogo.svg" height={16} width={16} alt="Huggingface logo" />
				Logs
			</Button>
		</a>
	);

	const chatButton = (
		<Link href={`/chat/${modelId}`}>
			<Button>
				<ChatBubbleBottomCenterIcon className="h-4 w-4" />
				Chat
			</Button>
		</Link>
	);

	if (state === "training" && wandbUrl) {
		return wandbButton;
	}

	if (state === "training") {
		return <Loader2Icon className="animate-spin h-5 w-5" />;
	}

	if (state === "finished") {
		const options = wandbUrl ? ["Logs", "Export"] : ["Export"];

		return (
			<>
				<ExportModal open={isExportModalOpen} setOpen={setIsExportModalOpen} modelId={modelId} hfToken={hfToken} />
				<div className="flex justify-center gap-x-1">
					{chatButton}
					<Dropdown
						options={options}
						onSelect={(item) => selectItem(item, modelId, wandbUrl)}
						dropdownDirection="downLeft"
					>
						<div className="px-1 py-2 rounded-lg hover:bg-gray-800">
							<EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
						</div>
					</Dropdown>
				</div>
			</>
		);
	}

	// If model is hardcoded we just show the chat button.
	if (state === "online") {
		return chatButton;
	}

	// Error state
	return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
}
