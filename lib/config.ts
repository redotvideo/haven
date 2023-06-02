const config = {
	server: {
		port: 3000,
	},
	gcloud: {
		projectId: "boreal-charter-379616",
		zone: "us-central1-a",
		bucket: "konsti-test-bucket",
	},
	worker: {
		dockerImage: "worker-smol",
		startupScript: "./gcloud/configurations/startup-script.sh",
		configFile: "./gcloud/configurations/simple-small-vps.json",
	},
};

export {config};
