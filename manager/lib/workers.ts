/**
 * Create a unique name for a worker.
 */
export async function generateName(model: string) {
	// use a MS timestamp as the base
	const ms = Date.now().toString(36);
	return `haven-${model}-${ms}`;
}
