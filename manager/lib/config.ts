const config = {
	setupDone: false, // Tells us if the manager is in a working state
	server: {
		port: 3000,
	},
	gcloud: {
		projectId: "", // Set during setup
		serviceAccount: "", // Set during setup
		clientId: "", // Set during setup
		zone: "me-west1-b",
		bucket: "konstis-test-bucket",
	},
	worker: {
		dockerImage: "docker.io/konsti1/peacefulplace-worker",
		startupScript: "./gcloud/configurations/startup-script.sh",
		configFile: "./gcloud/configurations/inference-A100.json",
	},
};

export {config};
