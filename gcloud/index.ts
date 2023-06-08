import { all } from "axios";
import * as fs from "fs";

import { config } from "../lib/config";

import {createComputeAPI, createFromTemplate, remove, getAllZones, getAcceleratorsByZone, getAllRegions, checkIfQuotaPermitsGPUs, findRegionsWithPermissiveGPUQuotas, getZonesToCreateVM, createInstanceTemplate} from "./resources";
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
	const zonesToDeploy = await getZonesToCreateVM(api, "nvidia-tesla-t4", 1);
	const zone = zonesToDeploy[0];

	if(zone){
		const template = await createInstanceTemplate(config.worker.configFile, "test-instance-from-template", "nvidia-tesla-t4", 4, zone, 300, "n1-standard-4");
		console.log(template);
		// createFromTemplate();

	}
	else{
		throw Error("you do not have the gcloud rights to create this instance");
	};
	
}
run();
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
