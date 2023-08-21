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

// Function to log the current minute along with the client's name
function logCurrentMinute(clientName: string, time: number) {
  console.log(`${clientName} is in its ${time} execution cycle.`);
}

// Client 1 logic
async function newClient(mnemonic: string, clientNumber: number) {
  const options = {
    network: NETWORK,
    mnemonic: mnemonic,
  };

  let time = 0;

  try {
    const gridClient = new GridClient(options);
    await gridClient.connect();

    // Log the current minute every minute
    setInterval(() => {
      time += 1; // script starts at the first minute, then after one minute will log the second..etc
      logCurrentMinute(`Client: ${clientNumber}`, time);
    }, 60000); // Log every minute (60000 milliseconds)

    // Run the task every 10 minutes
    setInterval(async () => {
      console.log(`Running task for Client ${clientNumber}...`);
      const twinID = await gridClient.twins.get_my_twin_id();
      console.log(`Client ${clientNumber} twin id: ${twinID}`);
    }, 10 * 60 * 1000); // Run every 10 minutes (10 * 60 * 1000 milliseconds)
  } catch (error) {
    console.error("Error connecting to Grid:", error);
  }
}

// Main function
async function main() {
  await newClient(clientMnemonic1, 1);
  await newClient(clientMnemonic2, 2);
}

// Start the script execution
main();
