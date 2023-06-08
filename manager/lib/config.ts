const config = {
	setupDone: false, // Tells us if the manager is in a working state
	server: {
		port: 3000,
		runFileServer: true,
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