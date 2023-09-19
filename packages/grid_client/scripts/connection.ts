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

// Choose the desired network (main, test, qa, dev)
const NETWORK = NetworkEnv.dev;

// Client 1 logic
async function newClient(mnemonic: string) {
  const options = {
    network: NETWORK,
    mnemonic: mnemonic,
  };

  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    setTimeout(async () => {
      console.log(`Request the grid to get the twin id.`);
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log(`Twin id: ${twinID}`);
    }, 10 * 60 * 1000);
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

// Main function
async function main() {
  await newClient(clientMnemonic1);
  await newClient(clientMnemonic2);
  console.log(`Please disconnect your internet connection.`);

  setTimeout(async () => {
    console.log(`Please re-connect your internet connection.`);
  }, 9 * 60 * 1000);
}

main();
