interface Props {
	children: React.ReactNode;
	primary?: React.ReactNode;
}

export default function PageHeading({children, primary}: Props) {
	return (
		<div className="mt-2 md:flex md:items-center md:justify-between">
			<div className="min-w-0 flex-1">
				<h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">{children}</h2>
			</div>
			<div className="mt-4 flex flex-shrink-0 gap-x-3 md:ml-4 md:mt-0">{primary}</div>
		</div>
	);
}
