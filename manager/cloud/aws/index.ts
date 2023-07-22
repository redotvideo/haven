import {
	EC2Client,
	DescribeInstancesCommand,
	DescribeRegionsCommand,
	AuthorizeSecurityGroupIngressCommand,
} from "@aws-sdk/client-ec2";
import {fromIni} from "@aws-sdk/credential-provider-ini";

function createEC2Client(region: string) {
	const client = new EC2Client({
		region,
		credentials: fromIni({
			configFilepath: "~/.aws/credentials",
		}),
	});
	return client;
}

async function getInstanceFromName(instanceName: string) {
	const ec2Client = createEC2Client("us-east-1");

	const regionsResponse = await ec2Client.send(new DescribeRegionsCommand({}));
	const regions = regionsResponse.Regions?.map((region) => region.RegionName) || [];

	const instances = await Promise.all(
		regions.map(async (region) => {
			if (!region) {
				return undefined;
			}

			const client = createEC2Client(region);

			const command = new DescribeInstancesCommand({
				Filters: [
					{
						Name: "tag:Name",
						Values: [instanceName],
					},
				],
			});

			try {
				const response = await client.send(command);
				const reservations = response.Reservations;
				if (reservations && reservations.length > 0) {
					return reservations[0].Instances![0];
				}
			} catch (error) {
				console.error("Error:", error);
			}
		}),
	);

	return instances.filter((instance) => instance !== undefined)[0];
}

async function enableInboundTraffic(client: EC2Client, securityGroupId: string, port: number, ipRange: string) {
	const params = {
		GroupId: securityGroupId,
		IpPermissions: [
			{
				FromPort: port,
				ToPort: port,
				IpProtocol: "tcp",
				IpRanges: [
					{
						CidrIp: ipRange,
					},
				],
			},
		],
	};

	const command = new AuthorizeSecurityGroupIngressCommand(params);

	try {
		await client.send(command);
		console.log(`Inbound traffic on port ${port} successfully enabled in region ${client.config.region}.`);
	} catch (error) {
		console.error(`Error enabling inbound traffic on port ${port} in region ${client.config.region}:`, error);
	}
}

export async function enableGrcpPorts(instanceName: string) {
	const instance = await getInstanceFromName(instanceName);

	if (!instance) {
		return;
	}

	// Get security group
	const securityGroup = instance.SecurityGroups?.[0];

	if (!securityGroup) {
		return;
	}

	// Enable port 50051 for inbound traffic
	const parsedRegion = instance.Placement?.AvailabilityZone?.slice(0, -1)!;
	const client = createEC2Client(parsedRegion);
	await enableInboundTraffic(client, securityGroup.GroupId!, 50051, "0.0.0.0/0");
	await enableInboundTraffic(client, securityGroup.GroupId!, 50052, "0.0.0.0/0");
}
