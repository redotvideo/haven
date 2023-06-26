import { EC2Client, RunInstancesCommand, DescribeInstanceTypesCommand } from "@aws-sdk/client-ec2";
import { fromIni } from "@aws-sdk/credential-provider-ini";

// Create the EC2Client with the specified region and credentials

/*
export async function createEC2Client(){
    const client = new EC2Client({
        region: "REGION",
        credentials: fromIni({
          configFilepath: "~/.aws/credentials",
        }),
      });

      return client;
}
*/

export async function createEC2Client(){
    const client = new EC2Client({
        region,
        credentials: {
        accessKeyId,
        secretAccessKey,
        },
    });

    return client;

}
  





export async function createEC2Instance(client: EC2Client, instanceType: string) {

    const params = {
        ImageId: "ami-12345", // Replace with the ID of the desired AMI (Amazon Machine Image)
        InstanceType: instanceType, // Replace with the desired GPU instance type
        MinCount: 1,
        MaxCount: 1,
      };
      
    const command = new RunInstancesCommand(params);
  
    try {
      const response = await client.send(command);
      console.log("EC2 instance created:", response.Instances);
    } catch (error) {
      console.error("Error creating EC2 instance:", error);
    }
}



export async function getInstanceType(client: EC2Client, gpuType: string, numGPUs: number) {
    const command = new DescribeInstanceTypesCommand({
      Filters: [
        { Name: "instance-type", Values: ["*"] }, // Filter all instance types
        { Name: "gpu-info.gpu-type", Values: [gpuType] }, // Filter by GPU type
        { Name: "gpu-info.count", Values: [numGPUs.toString()] }, // Filter by number of GPUs
      ],
    });
  
    try {
      const response = await client.send(command);
      console.log("Matching Instance Types:", response.InstanceTypes);
    } catch (error) {
      console.error("Error retrieving instance types:", error);
    }
  }
  
  





