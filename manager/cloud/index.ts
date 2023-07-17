import * as fs from "fs";
import {Cloud} from "../api/pb/manager_pb";

interface GCPInfo {
	projectId: string;
	serviceAccount: string;
	clientId: string;
}

class CloudManager {
	gcp: GCPInfo | null = null;
	aws = false;

	constructor() {
		// Create folder for credentials
		// Sync because it's in the constructor and only runs when the manager starts
		fs.mkdirSync("./credentials");
	}

	/**
	 * Checks if we're already logged into the specified cloud provider.
	 */
	public isCloudSetUp(cloud: Cloud) {
		switch (cloud) {
			case Cloud.GCP:
				return this.gcp !== null;
			case Cloud.AWS:
				return this.aws;
			default:
				throw new Error("[isCloudSetUp] Unknown cloud");
		}
	}

	/**
	 * Creates or updates the GCP key file.
	 *
	 * @param file The key file as a string
	 */
	private async updateGcp(file: string) {
		const isValidJson = await Promise.resolve()
			.then(() => JSON.parse(file))
			.catch(() => false);

		if (isValidJson === false) {
			throw new Error("[updateGcp] Invalid key file");
		}

		// Check if there is already a key file
		const doesKeyExist = await fs.promises
			.access("./credentials/gcp.json")
			.then(() => true)
			.catch(() => false);

		if (doesKeyExist) {
			console.log("[updateGcp] Key file already exists. Deleting old key file.");
			await fs.promises.unlink("./credentials/gcp.json");
		}

		await fs.promises.writeFile("./credentials/gcp.json", file);

		this.gcp = {
			projectId: isValidJson.project_id,
			serviceAccount: isValidJson.client_email,
			clientId: isValidJson.client_id,
		};

		process.env.GOOGLE_APPLICATION_CREDENTIALS = "./credentials/gcp.json";
	}

	private async updateAws(file: string) {}

	/**
	 * Update credentials of the specified cloud provider.
	 * @param cloud
	 * @param file
	 */
	public async updateCloud(cloud: Cloud, file: string) {
		if (cloud === Cloud.GCP) {
			await this.updateGcp(file);
		}

		if (cloud === Cloud.AWS) {
			await this.updateAws(file);
		}
	}
}

export const cloudManager = new CloudManager();
