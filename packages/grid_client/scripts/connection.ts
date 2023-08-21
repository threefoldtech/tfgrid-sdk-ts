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
const clientMnemonic1 = "actual reveal dish guilt inner film scheme between lonely myself material replace";
const clientMnemonic2 = "actual reveal dish guilt inner film scheme between lonely myself material replace";

// Choose the desired network (main, test, qa, dev)
const NETWORK = NetworkEnv.dev;
let sessionTime = 0;
// Function to log the current minute along with the client's name
function logCurrentMinute(time: number) {
  if (time < 9) {
    console.log(`${time}: Please disconnect your internet connection.`);
  } else {
    console.log(`${time}: Please re-connect your internet connection.`);
  }
}

// Client 1 logic
async function newClient(mnemonic: string) {
  const options = {
    network: NETWORK,
    mnemonic: mnemonic,
  };

  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    // Run the task every 10 minutes
    setInterval(async () => {
      console.log(`Requist the grid to get the twin id.`);
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log(`Twin id: ${twinID}`);
      sessionTime = 0;
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

// Main function
async function main() {
  await newClient(clientMnemonic1);
  await newClient(clientMnemonic2);

  // Log the current minute every minute
  setInterval(() => {
    sessionTime += 1; // script starts at the first minute, then after one minute will log the second..etc
    logCurrentMinute(sessionTime);
  }, 60000); // Log every minute (60000 milliseconds)
}

// Start the script execution
main();
