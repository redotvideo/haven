const config = {
	setupDone: false, // Tells us if the manager is in a working state
	server: {
		bearerToken: process.env.BEARER_TOKEN || "insecure",
	},
	gcloud: {
		projectId: "", // Set during setup
		serviceAccount: "", // Set during setup
		clientId: "", // Set during setup
	},
	worker: {
		dockerImage: "docker.io/havenhq/worker:2023.06.29",
		startupScript: "./config/gcp/startup-script.sh",
	},
	telemetry: process.env.DISABLE_TELEMETRY !== "true",
};

export {config};
