import {ArrowUpLeftIcon, ArrowUpRightIcon} from "@heroicons/react/24/outline";
import Buttons from "./buttons";
import type {ModelProps} from "./page";

const environments = {
	training: "text-yellow-400 bg-yellow-400/10 ring-yellow-400/20",
	finished: "text-green-500 bg-green-500/10 ring-green-500/30",
	error: "text-red-500 bg-red-500/10 ring-red-500/30",
};

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

interface ModelListProps {
	header?: string;
	// typeof return type of getModels
	models: ModelProps[];
	hfToken?: string;
}

function Empty() {
	return (
		<div className="mt-24 flex flex-col items-center justify-center space-y-2">
			<div className="hidden md:block">
				<ArrowUpRightIcon className="h-10 w-10 text-gray-600" />
			</div>
			<div className="block md:hidden">
				<ArrowUpLeftIcon className="h-10 w-10 text-gray-600" />
			</div>
			<p className="text-center pt-4 text-gray-600">
				{"You haven't trained any models yet. "}
				<br />
				<a href="https://haven.mintlify.app/introduction" className="underline">
					Refer to the docs.
				</a>
			</p>
		</div>
	);
}

export default function List({header, models, hfToken}: ModelListProps) {
	return (
		<>
			{header && (
				<>
					<div className="px-4 sm:px-6 lg:px-8">
						<div className="mt-4 text-white font-semibold text-lg">{header}</div>
					</div>
					<div className="mt-4 border-b" />
				</>
			)}

			{models.length ? (
				<ul role="list" className="divide-y divide-black/5">
					{models.map((model) => (
						<li key={model.modelName} className="relative flex items-center space-x-4 px-4 py-4 sm:px-6 lg:px-8">
							<div className="min-w-0 flex-auto">
								<div className="flex items-center gap-x-3">
									<h2 className="min-w-0 text-sm font-semibold leading-6">
										<div className="flex gap-x-2">
											<span className="whitespace-nowrap">{model.modelName}</span>
										</div>
									</h2>
									<div
										className={classNames(
											environments[model.status as keyof typeof environments],
											"rounded-full flex-none py-1 px-2 text-xs font-medium ring-1 ring-inset",
										)}
									>
										{model.status.charAt(0).toUpperCase() + model.status.slice(1)}
									</div>
								</div>
								<div className="mt-3 flex items-center gap-x-2.5 text-xs leading-5 text-gray-400">
									<p className="truncate">{model.baseModel}</p>
									{model.datasetName && (
										<>
											<div className="bg-gray-400 h-1 w-1 rounded-full" />
											<p className="truncate">{model.datasetName}</p>
										</>
									)}
								</div>
							</div>
							<Buttons
								modelId={model.id}
								state={model.status as keyof typeof environments}
								wandbUrl={model.wandbUrl}
								hfToken={hfToken}
							/>
						</li>
					))}
				</ul>
			) : (
				<Empty />
			)}
		</>
	);
}
