const HOSTNAME = process.env.MODAL_HOSTNAME || "";

export async function uploadFile(file: string, filename: string) {
	const body = JSON.stringify({
		file,
		filename,
	});

	const response = await fetch(`${HOSTNAME}/upload`, {
		method: "POST",
		body,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Could not upload file.");
	}

	return response.text();
}

export async function downloadFile(fileName: string) {
	const body = JSON.stringify({
		fileName,
	});

	const response = await fetch(`${HOSTNAME}/download`, {
		method: "POST",
		body,
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Could not download file.");
	}

	return response.text();
}
