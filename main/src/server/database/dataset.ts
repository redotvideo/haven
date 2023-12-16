import {db} from ".";

export async function createDataset(userId: string, name: string, fileName: string, rows: number) {
	return db.dataset.create({
		data: {
			userId,
			name,
			fileName,
			rows,
		},
	});
}

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
