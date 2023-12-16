import Padding from "~/components/padding";
import PageHeading from "~/components/page-heading";
import Sidebar from "~/components/sidebar";
import {checkSession} from "~/server/utils/session";
import DatasetTable from "./table";
import {getDatasets} from "~/server/database/dataset";

import type {Dataset} from "@prisma/client";

function updatedAtToPrettyString(updatedAt: Date) {
	const now = new Date();
	const diff = now.getTime() - updatedAt.getTime();
	const diffInDays = diff / (1000 * 3600 * 24);
	const diffInWeeks = diffInDays / 7;

	if (diffInWeeks >= 3) {
		return `${Math.floor(diffInWeeks)} weeks ago`;
	}

	if (Math.floor(diffInDays) == 1) {
		return "1 day ago";
	}

	if (diffInDays > 1) {
		return `${Math.floor(diffInDays)} days ago`;
	}

	const diffInHours = diff / (1000 * 3600);
	if (Math.floor(diffInHours) == 1) {
		return "1 hour ago";
	}

	if (diffInHours > 1) {
		return `${Math.floor(diffInHours)} hours ago`;
	}

	const diffInMinutes = diff / (1000 * 60);
	if (Math.floor(diffInMinutes) == 1) {
		return "1 minute ago";
	}

	if (diffInMinutes >= 1) {
		return `${Math.floor(diffInMinutes)} minutes ago`;
	}

	return "Just now";
}

function filterPropsForTable(datasets: Dataset[]) {
	return datasets.map((dataset) => ({
		id: dataset.id,
		name: dataset.name,
		rows: dataset.rows,
		created: updatedAtToPrettyString(dataset.createdAt),
	}));
}

export type DatasetTableProps = ReturnType<typeof filterPropsForTable>;

export default async function Page() {
	const session = await checkSession();
	const datasets = await getDatasets(session.user.id);
	const filtered = filterPropsForTable(datasets);

	return (
		<Sidebar current="Datasets">
			<Padding>
				<PageHeading>Datasets</PageHeading>
			</Padding>
			<div className="mt-6 border-b border-gray-800" />
			<DatasetTable datasets={filtered} />
		</Sidebar>
	);
}
