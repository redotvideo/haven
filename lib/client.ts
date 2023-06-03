/**
 * Communicates with the worker.
 */

import axios from "axios";

export async function getPrediction(ip: string, prompt: string) {
	const response = await axios.post(`http://${ip}:5001/predict`, {
		prompt,
	});
	return response.data;
}

export type HealthStatus = "running" | "stopping" | "offline";

export async function getHealth(ip: string): Promise<HealthStatus> {
	const status = await axios
		.get(`http://${ip}:5001/health`, {timeout: 1000})
		.then(() => "running")
		.catch((error) => {
			if (error.response?.status === 500) {
				return "stopping";
			}
			return "offline";
		});

	return status as HealthStatus;
}

export async function sendStopSignal(ip: string) {
	await axios.get(`http://${ip}:5001/stop`);
}
