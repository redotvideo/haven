const config = {
	setupDone: false, // Tells us if the manager is in a working state
	telemetryOkay: true,
	server: {
		bearerToken: "insecure" || process.env.BEARER_TOKEN,
	},
	gcloud: {
		projectId: "", // Set during setup
		serviceAccount: "", // Set during setup
	},
	worker: {
		dockerImage: "docker.io/konsti1/peacefulplace-worker",
		startupScript: "./gcloud/configurations/startup-script.sh",
	},
};

export {config};
