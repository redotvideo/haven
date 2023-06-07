const config = {
	server: {
		port: 3000,
	},
	gcloud: {
		projectId: "boreal-charter-379616",
		zone: "me-west1-b",
		bucket: "konsti-test-bucket",
	},
	worker: {
		dockerImage: "worker-massive",
		startupScript: "./gcloud/configurations/startup-script.sh",
		configFile: "./gcloud/configurations/inference-A100.json",
	},
};

export {config};
