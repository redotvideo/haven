import {storage_v1, google} from "googleapis";
import {Storage} from "@google-cloud/storage";

const storage = new Storage();

export async function readFilesInBucket(bucketName: string, path: string) {
	const [files] = await storage.bucket(bucketName).getFiles({
		prefix: path,
	});

	return files;
}

export function uploadFileToBucket(bucketName: string, fileName: string, destination: string) {
	return storage.bucket(bucketName).upload(fileName, {
		destination,
	});
}

export async function generateSignedUrl(bucketName: string, fileName: string) {
	const [url] = await storage
		.bucket(bucketName)
		.file(fileName)
		.getSignedUrl({
			version: "v4",
			action: "read",
			expires: Date.now() + 5 * 60 * 1000, // 5 minutes
		});

	return url;
}
