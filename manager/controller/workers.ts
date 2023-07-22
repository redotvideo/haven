import {Code, ConnectError} from "@bufbuild/connect";
import {Cloud, Worker} from "../api/pb/manager_pb";
import {cloudManager} from "../cloud";
import {CloudInterface} from "../cloud/interface";

export async function listWorkersController(): Promise<Worker[]> {
	const aws = cloudManager.get(Cloud.AWS);
	const gcp = cloudManager.get(Cloud.GCP);

	async function getWorkers(cloud?: CloudInterface) {
		return (
			cloud?.listInstances().catch((e) => {
				console.error(e);
				throw new ConnectError(
					`Failed to get a list of all workers from ${Cloud[cloud.cloud]}: ${e.message}`,
					Code.Internal,
				);
			}) ?? []
		);
	}

	const [awsWorkers, gcpWorkers] = await Promise.all([getWorkers(aws), getWorkers(gcp)]);
	return [...awsWorkers, ...gcpWorkers];
}
