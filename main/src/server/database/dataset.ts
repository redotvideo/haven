import {db} from ".";

export async function createDataset(userId: string, name: string, fileName: string, rows: number, huggingFaceUrl: string, huggingFaceId: string) {
	return db.dataset.create({
		data: {
			userId,
			name,
			fileName,
			rows,
			huggingFaceUrl,
			huggingFaceId,
		},
	});
}
// Note: The database schema needs to be updated to include 'huggingFaceUrl' and 'huggingFaceId' fields. These fields should be of type string.

export async function getDatasets(userId: string) {
	return db.dataset.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}

// Note: this might become slow at some point
export async function getDatasetsByNameForUser(userId: string, name: string) {
	return await db.dataset.findMany({
		where: {
			userId,
			name: {
				contains: name,
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 5,
	});
}

export async function getDatasetById(id: string, userId: string) {
	return db.dataset.findUnique({
		where: {
			id,
			userId,
		},
	});
}
