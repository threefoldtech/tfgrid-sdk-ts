import { getClient } from "../client_loader";

async function main() {
  const grid3 = await getClient();
  await grid3.tfchain.init({ name: "harby", secret: grid3.clientOptions.mnemonic });
  await grid3.tfchain.vote({
    name: "harby",
    address: "5FWW1F7XHaiRgPEqJdkv9nVgz94AVKXkTKNyfbLcY4rqpaNM",
    farmId: 246,
    hash: "0xa539b59dcf7ba10764a49c9effb88aea400d3c20f0071c3b85494423079757fe",
    approve: true,
  });

  await grid3.disconnect();
}

main();
