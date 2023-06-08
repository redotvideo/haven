const config = {
	server: {
		port: 3000,
	},
	gcloud: {
		projectId: "boreal-charter-379616",
		zone: "europe-central2-b",
		bucket: "konsti-test-bucket",
		serviceAccount: "konsti-test@boreal-charter-379616.iam.gserviceaccount.com"
	},
	worker: {
		dockerImage: "worker-massive",
		startupScript: "./gcloud/configurations/startup-script.sh",
		configFile: "./gcloud/configurations/instance-skeleton.template",
	},
};

export {config};
