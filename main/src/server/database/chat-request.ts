import {db} from ".";

/**
 * Returns the number of chat requests the user has made in the last 24 hours.
 */
export async function getNumberOfChatRequestsInLast24Hours(userId: string) {
	const now = new Date();
	const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	return db.chatRequest.count({
		where: {
			userId: userId,
			createdAt: {
				gte: yesterday,
			},
		},
	});
}

/**
 * Creates a new chat request.
 */
export async function createChatRequest(userId: string, modelId: string) {
	return db.chatRequest.create({
		data: {
			userId,
			modelId,
		},
	});
}
