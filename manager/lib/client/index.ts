import {PromiseClient, Transport, createPromiseClient} from "@bufbuild/connect";
import {createGrpcTransport} from "@bufbuild/connect-node";
import {WorkerService} from "./pb/worker_connect";
import {WorkerStatus} from "./pb/worker_pb";

const clients = new Map<string, PromiseClient<typeof WorkerService>>();

/**
 * Returns the client that belongs to the worker at the given IP address.
 *
 * TODO(konsti): decommission clients once the worker is paused or destroyed.
 *
 * @param ip
 * @returns
 */
export function getTransport(ip: string): PromiseClient<typeof WorkerService> {
	if (!clients.has(ip)) {
		const transport = createGrpcTransport({
			baseUrl: `http://${ip}:50051`,
			httpVersion: "2",
		});

		const client = createPromiseClient(WorkerService, transport);
		clients.set(ip, client);
	}

	return clients.get(ip)!;
}

export async function getStatus(ip: string): Promise<WorkerStatus> {
	return getTransport(ip)
		.health({}, {timeoutMs: 5000})
		.then((res) => res.status)
		.catch(() => WorkerStatus.OFFLINE);
}
