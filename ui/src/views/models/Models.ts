// Route http://localhost:3000/v1/models

import {Client} from "../../lib/client";
import {Status} from "../../lib/client/pb/manager_pb";
import {navigate} from "../../lib/navigation";

const BASE = "http://localhost:3000";

export async function getModels() {
	return (await fetch(`${BASE}/v1/models`).then((res) => res.json())).models;
}

export enum Action {
	CHAT,
	DELETE,
	CREATE,
	PAUSE,
	RESUME,
	RETRY,
}

export const actions = {
	[Action.CHAT]: chat,
	[Action.DELETE]: Client.deleteWorker,
	[Action.CREATE]: Client.createWorker,
	[Action.PAUSE]: Client.pauseWorker,
	[Action.RESUME]: Client.resumeWorker,
	[Action.RETRY]: () => {},
};

export const newStatus = {
	[Action.CHAT]: Status.RUNNING,
	[Action.DELETE]: Status.STOPPING,
	[Action.CREATE]: Status.STARTING,
	[Action.PAUSE]: Status.STOPPING,
	[Action.RESUME]: Status.STARTING,
	[Action.RETRY]: Status.STARTING,
};

function chat({name}: {name: string}) {
	navigate(`/models/${name}/chat`);
}
