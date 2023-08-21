/* 
  Use this script to test grid connection:
  This script creates 2 instances of the grid client, then after 10 minutes, it performs a query on both instances.

  Steps:
    1 - Connect to the grid
    2 - Close the internet connection
    3 - After 9 minutes, open the internet connection again
  The grid should automatically reconnect and request the twin ID.
*/

import { GridClient, NetworkEnv } from "../src";

// Replace with actual mnemonics
const clientMnemonic1 = "your_mnemonic_here";
const clientMnemonic2 = "your_mnemonic_here";
const storeSecret = "store_secret";

// Choose the desired network (main, test, qa, dev)
const NETWORK = NetworkEnv.dev;

// Function to log the current minute along with the client's name
function logCurrentMinute(clientName) {
  const now = new Date();
  console.log(`${clientName} running in minute ${now.getMinutes()}`);
}

// Client 1 logic
async function client1() {
  const options = {
    network: NETWORK,
    mnemonic: clientMnemonic1,
    storeSecret: storeSecret,
  };
  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    // Log the current minute every minute
    setInterval(() => {
      logCurrentMinute("Client 1");
    }, 60000); // Log every minute (60000 milliseconds)

    // Run the task every 10 minutes
    setInterval(async () => {
      console.log("Running task for Client 1...");
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log("Client 1 twin id: ", twinID);
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

// Client 2 logic
async function client2() {
  const options = {
    network: NETWORK,
    mnemonic: clientMnemonic2,
    storeSecret: storeSecret,
  };
  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    // Log the current minute every minute
    setInterval(() => {
      logCurrentMinute("Client 2");
    }, 60000); // Log every minute (60000 milliseconds)

    // Run the task every 10 minutes
    setInterval(async () => {
      console.log("Running task for Client 2...");
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log("Client 2 twin id: ", twinID);
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

// Main function
async function main() {
  logCurrentMinute("Script start");
  await client1();
  await client2();
}

// Start the script execution
main();
