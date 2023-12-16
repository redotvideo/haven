import {db} from ".";

export async function getModels(userId: string) {
	return db.model.findMany({
		where: {
			userId,
		},
	});
}

export async function getModelFromId(id: string) {
	return db.model.findUnique({
		where: {
			id,
		},
	});
}

export async function createModel(
	userId: string,
	name: string,
	costInCents: number,
	datasetId: string,
	learningRate: string,
	epochs: number,
	baseModel: string,
) {
	return db.model.create({
		data: {
			userId,
			name,
			costInCents,
			datasetId,
			learningRate,
			epochs,
			baseModel,
		},
	});
}

export async function addWandBUrl(modelId: string, wandbUrl: string) {
	return db.model.update({
		where: {
			id: modelId,
		},
		data: {
			wandbUrl,
		},
	});
}

export async function updateState(modelId: string, state: "training" | "finished" | "error") {
	return db.model.update({
		where: {
			id: modelId,
		},
		data: {
			state,
		},
	});
}

export async function getJobCostInCents(modelId: string) {
	return (
		await db.model.findUnique({
			where: {
				id: modelId,
			},
			select: {
				costInCents: true,
			},
		})
	)?.costInCents;
}
