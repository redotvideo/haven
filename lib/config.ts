const config = {
	server: {
		port: 3000,
	},
	gcloud: {
		projectId: "boreal-charter-379616",
		zone: "europe-central2-b",
		bucket: "konsti-test-bucket",
	},
	worker: {
		dockerImage: "worker-massive",
		startupScript: "./gcloud/configurations/startup-script.sh",
		configFile: "./gcloud/configurations/inference-mvp.json",
	},
};

export {config};
