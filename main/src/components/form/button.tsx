"use client";
import {Loader2} from "lucide-react";

interface Props {
	id?: string;
	onClick?: () => void;
	loading?: boolean;
	className?: string;
	type?: "button" | "submit"; // set to submit for forms
	children?: React.ReactNode;
}

export default function Button({
	id,
	onClick = undefined,
	loading = false,
	className = "",
	type = "button",
	children,
}: Props) {
	return (
		<button
			id={id}
			type={type}
			className={`inline-flex items-center gap-x-2 rounded-md text-gray-300 bg-gray-900 px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-700 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
			{...(onClick && {onClick})}
			disabled={loading}
		>
			{loading && <Loader2 className="animate-spin mr-2" size={16} />}
			{children}
		</button>
	);
}
