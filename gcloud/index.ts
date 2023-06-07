import { all } from "axios";
import * as fs from "fs";

import {createComputeAPI, createFromTemplate, remove, getAllZones, getAcceleratorsByZone, getAllRegions, checkIfQuotaPermitsGPUs} from "./resources";
import {generateSignedUrl, readFilesInBucket, uploadFileToBucket} from "./storage";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./key.json";

const bucketName = "konsti-test-bucket";


async function createStartupScript(path: string, dockerImageUrl: string) {
	const file = await fs.promises.readFile(path);
	let startupScript = file.toString();

	startupScript = startupScript.replace("{download_url}", dockerImageUrl);

	return startupScript;
}




async function findRegions(gpuName: string, gpuNum: number){
	const api = await createComputeAPI();

	const allRegions = await getAllRegions(api);
	const quotaPermissibleRegions = [];

	await allRegions.forEach( async (region) => {
		if (region.name){
			const quotaPermits = await checkIfQuotaPermitsGPUs(region, gpuNum, gpuName);
			if(quotaPermits){
				quotaPermissibleRegions.push(region)
			}
		}
	});

	return quotaPermissibleRegions;
}

findRegions("nvidia-tesla-t4", 4);

/*async function run() {
	await uploadFileToBucket(bucketName, "./worker/docker_image.tar");
	console.log("uploaded");
	const files = await readFilesInBucket(bucketName);
	const url = await generateSignedUrl(bucketName, files[0].name);
	console.log("generated url");

	const startupScript = await createStartupScript("./gcloud/configurations/startup-script.sh", url);

	const api = await createComputeAPI();
	const vm = await createFromTemplate(
		api,
		"us-central1-a",
		"./gcloud/configurations/simple-small-vps.json",
		startupScript,
	);

	console.log(vm);
}

run();*/
