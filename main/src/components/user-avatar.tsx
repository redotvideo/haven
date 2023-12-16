export default function UserAvatar({name}: {name?: string}) {
	const nameWithDefault = name || "";

	return (
		<div>
			<div className="h-8 w-8 text-center rounded-md border-2 border-gray-100 bg-gray-50 leading-7 text-gray-400 dark:border-gray-800 dark:bg-gray-900">
				{nameWithDefault.charAt(0).toUpperCase()}
			</div>
		</div>
	);
}
