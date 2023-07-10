const config = {
	version: "0.1.0", // Current version of the manager
	setupDone: false, // Tells us if the manager is in a working state
	server: {
		bearerToken: process.env.BEARER_TOKEN || "insecure",
		disableAdmin: process.env.DISABLE_ADMIN === "true", // Disable admin endpoints
	},
	gcloud: {
		projectId: "", // Set during setup
		serviceAccount: "", // Set during setup
		clientId: "", // Set during setup
	},
	worker: {
		dockerImage: process.env.CUSTOM_WORKER_IMAGE || "docker.io/havenhq/worker:v0.1",
		startupScript: "./config/gcp/startup-script.sh",
	},
	telemetry: process.env.DISABLE_TELEMETRY !== "true",
};

export {config};
