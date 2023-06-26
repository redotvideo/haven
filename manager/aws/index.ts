import { createEC2Client, getInstanceType } from "./resources";


async function test() {
    const client = await createEC2Client();
    console.log("done");
    console.log(client);
    await getInstanceType(client, "g5", 2)
}

test();
