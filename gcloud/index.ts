import { all } from "axios";
import * as fs from "fs";

import {createComputeAPI, createFromTemplate, remove, getAllZones, getAcceleratorsByZone, getAllRegions, checkIfQuotaPermitsGPUs, findRegionsWithPermissiveGPUQuotas, getZonesToCreateVM} from "./resources";
import {generateSignedUrl, readFilesInBucket, uploadFileToBucket} from "./storage";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "./key.json";

const bucketName = "konsti-test-bucket";


async function createStartupScript(path: string, dockerImageUrl: string) {
	const file = await fs.promises.readFile(path);
	let startupScript = file.toString();

	startupScript = startupScript.replace("{download_url}", dockerImageUrl);

	return startupScript;
}


async function run() {
	const api = await createComputeAPI();
	const zonesToDeploy = await getZonesToCreateVM(api, "nvidia-tesla-a100", 1)
	
	return zonesToDeploy;
}

const usableZones = run();
console.log(usableZones);

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
