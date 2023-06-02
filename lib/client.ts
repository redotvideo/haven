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
