import * as y from "yup";
import {getDatasetsByNameForUser} from "~/server/database/dataset";
import {checkSessionAction} from "~/server/utils/session";

import type {Dataset} from "@prisma/client";

const bodySchema = y
	.object({
		query: y.string(),
	})
	.required();

function filterDatasetProperties(datasets: Dataset[]) {
	return datasets.map((dataset) => ({
		id: dataset.id,
		name: dataset.name,
		rows: dataset.rows,
	}));
}

export type SearchResponse = ReturnType<typeof filterDatasetProperties>;

export async function POST(request: Request) {
	const session = await checkSessionAction();

	const body = await request.json();
	const validatedBody = await bodySchema.validate(body);

	const results = await getDatasetsByNameForUser(session.user.id, validatedBody.query || "");

	return new Response(JSON.stringify(filterDatasetProperties(results)), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
