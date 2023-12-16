import Padding from "~/components/padding";
import PageHeading from "~/components/page-heading";
import Sidebar from "~/components/sidebar";
import List from "./list";
import Button from "~/components/form/button";
import {PlusIcon} from "@heroicons/react/20/solid";
import Link from "next/link";
import {getModels} from "~/server/database/model";
import {checkSession} from "~/server/utils/session";

import type {Dataset, Model} from "@prisma/client";
import {getDatasetById} from "~/server/database/dataset";

function newModelButton() {
	return (
		<Link href="/models/new">
			<Button className="gap-x-1">
				<PlusIcon className="h-4 w-4" />
				Train model
			</Button>
		</Link>
	);
}

// db is a prisma client. we use the types from the model table for the models array
function filterPropsForTable(models: Model[], datasetNames: Map<string, string>) {
	return models.map((model) => ({
		id: model.id,
		modelName: model.name,
		datasetName: datasetNames.get(model.datasetId || ""),
		status: model.state,
		baseModel: model.baseModel,
		wandbUrl: model.wandbUrl || undefined,
	}));
}

export type ModelProps = ReturnType<typeof filterPropsForTable>[number];

const defaultModels: ModelProps[] = [
	{
		id: "mixtral-8x7b",
		modelName: "Mixtral 8x7b Chat",
		status: "online",
		baseModel: "Chat with Mistral's new model - Limited availability",
		datasetName: undefined,
		wandbUrl: undefined,
	},
	{
		id: "zephyr",
		modelName: "Zephyr 7b",
		status: "online",
		baseModel: "A chat fine-tune of Mistral's 7b base-model",
		datasetName: undefined,
		wandbUrl: undefined,
	},
	{
		id: "llama2-7b",
		modelName: "Llama 2 7b Chat",
		status: "online",
		baseModel: "The chat version of Meta's popular Llama 2 model",
		datasetName: undefined,
		wandbUrl: undefined,
	},
];

export default async function Page() {
	const session = await checkSession();
	const models = await getModels(session.user.id);

	// get unique dataset Ids
	const datasetIds = Array.from(new Set(models.map((model) => model.datasetId)));

	// filter out null values
	const filteredDatasetIds = datasetIds.filter((id) => id !== null) as string[];

	// for each dataset, get the dataset name
	const datasets = await Promise.all(filteredDatasetIds.map((id) => getDatasetById(id, session.user.id)));

	// create a map of dataset id to dataset name
	const datasetMap = new Map<string, string>();
	datasets.forEach((dataset) => {
		if (!dataset) {
			return;
		}

		datasetMap.set(dataset.id, dataset.name);
	});

	return (
		<Sidebar current="Models">
			<Padding>
				<PageHeading primary={newModelButton()}>Models</PageHeading>
			</Padding>
			<div className="mt-6 border-b border-gray-800" />
			<List models={defaultModels} hfToken={session.user.hfToken} />
			<div className="mt-6 border-b" />
			<List header={"Your models"} models={filterPropsForTable(models, datasetMap)} hfToken={session.user.hfToken} />
		</Sidebar>
	);
}
