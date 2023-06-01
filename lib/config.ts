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
		dockerImage: "worker-massive",
		startupScript: "./gcloud/configurations/simple-big-storage/startup-script.sh",
		configFile: "./gcloud/configurations/simple-big-storage/simple-big-vps.json",
	},
};

export {config};
