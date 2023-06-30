import {Code, ConnectError} from "@bufbuild/connect";
import {Status, Worker} from "../api/pb/manager_pb";
import {createComputeAPI, list} from "../gcp/resources";
import {getStatus} from "../lib/client";
import {getWorkerIP, mapStatus} from "../lib/workers";

export async function listWorkersController() {
	const api = await createComputeAPI();
	const workers = await list(api).catch((e) => {
		console.error(e);
		throw new ConnectError(`Failed to get a list of all workers from GCloud: ${e.message}`, Code.Internal);
	});

	const workerList: Worker[] = [];

	for (const worker of workers) {
		const name = worker.name;

		if (!name) {
			console.error(`List Workers: Worker has no name: ${JSON.stringify(worker)}`);
			continue;
		}

		// If the name doesn't have the haven-w- prefix, we ignore it
		if (!name.startsWith("haven-w-")) {
			continue;
		}

		// If it doesn't have a public IP, it's paused
		const ip = getWorkerIP(worker);
		if (!ip) {
			workerList.push(
				new Worker({
					workerName: name,
					status: Status.PAUSED,
				}),
			);
			continue;
		}

		// Get status
		const vmStatus = worker.status;
		const serviceStatus = await getStatus(ip);

		const status = mapStatus(serviceStatus, vmStatus);

		workerList.push(
			new Worker({
				workerName: name,
				status,
			}),
		);
	}

	return workerList;
}
