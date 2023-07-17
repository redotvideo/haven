const config = {
	version: "0.2.0", // Current version of the manager
	server: {
		bearerToken: process.env.BEARER_TOKEN || "insecure",
		disableAdmin: process.env.DISABLE_ADMIN === "true", // Disable admin endpoints
	},
	worker: {
		dockerImage: process.env.CUSTOM_WORKER_IMAGE || "docker.io/havenhq/worker:v0.2",
		startupScript: "./config/gcp/startup-script.sh",
	},
	telemetry: process.env.DISABLE_TELEMETRY !== "true",
};

export {config};
