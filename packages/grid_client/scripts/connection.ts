import { GridClient, NetworkEnv } from "../src";

function logCurrentMinute(clientName) {
  const now = new Date();
  console.log(`${clientName} running in minute ${now.getMinutes()}`);
}

async function client1() {
  const mnemonic = "actual reveal dish guilt inner film scheme between lonely myself material replace";
  const options = {
    network: NetworkEnv.main,
    mnemonic,
    storeSecret: "coolSecretPhrase",
  };
  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    setInterval(() => {
      logCurrentMinute("Client 1");
    }, 60000); // Log every minute (60000 milliseconds)

    setInterval(async () => {
      console.log("Running task for Client 1...");
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log("Client 1 twin id: ", twinID);
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

async function client2() {
  const mnemonic = "miss secret news run cliff lens exist clerk lucky cube fall soldier";
  const options = {
    network: NetworkEnv.main,
    mnemonic,
    storeSecret: "coolSecretPhrase",
  };
  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    setInterval(() => {
      logCurrentMinute("Client 2");
    }, 60000); // Log every minute (60000 milliseconds)

    setInterval(async () => {
      console.log("Running task for Client 2...");
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log("Client 2 twin id: ", twinID);
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

async function main() {
  logCurrentMinute("Script start");
  await client1();
  await client2();
}

main();
