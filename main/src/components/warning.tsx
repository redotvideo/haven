import {ExclamationTriangleIcon} from "@heroicons/react/24/outline";

interface Props {
	message: string;
}

export default function Warning(props: Props) {
	return (
		<div className="m-4 mx-6 p-2 bg-yellow-700/20 rounded-md text-yellow-600 flex items-center gap-x-3">
			<div>
				<ExclamationTriangleIcon className="h-5 w-5 flex-none" aria-hidden="true" />
			</div>
			<div>{props.message}</div>
		</div>
	);
}
