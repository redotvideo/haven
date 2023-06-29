const config = {
	setupDone: false, // Tells us if the manager is in a working state
	server: {
		bearerToken: "insecure" || process.env.BEARER_TOKEN,
	},
	gcloud: {
		projectId: "", // Set during setup
		serviceAccount: "", // Set during setup
		clientId: "",
	},
	worker: {
		dockerImage: "docker.io/havenhq/worker:2023.06.29",
		startupScript: "./gcloud/configurations/startup-script.sh",
	},
	telemetry: false, // Set during setup
};

export {config};
