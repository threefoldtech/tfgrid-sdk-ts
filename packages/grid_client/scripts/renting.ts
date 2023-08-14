/*
# Renting Nodes Test Script.

This script is intended for testing the process of renting nodes. It includes functions to:
1. Get rentable nodes
2. Reserve a node
3. Get rent contract ID for a reserved node
4. Unreserve a node

** HINT: Modify it according to your needs and follow coding best practices.
** HINT: If you intend to unreserve a node you've rented, modify the 'unreserve' caller to have the rented node's ID hard-coded and comment out the rest of the script to prevent re-renting another node.
*/

// Import required modules
import { GridClient } from "../src/client";
import { getClient } from "./client_loader";
import { log } from "./utils";

// Main function
async function main() {
  try {
    // Initialize the client
    const client = await getClient();

    // Get a list of rentable nodes
    const rentableNodes = await getRentableNodes(client);

    // If there are rentable nodes available
    if (rentableNodes.length) {
      const reservedNodeId = rentableNodes[0].nodeId;

      // Reserve the first available node
      await reserveNode(client, reservedNodeId);

      // Get the rent contract for the reserved node
      await getRentContract(client, reservedNodeId);

      // Uncomment the line below if you intend to perform unreserve.
      // await unreserve(client, reservedNodeId);
    }

    // Disconnect the client
    await client.disconnect();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Get rent contract ID for a node
async function getRentContract(client: GridClient, nodeId: number) {
  try {
    const rentContractId = await client.nodes.getRentContractId({ nodeId });
    log("================= Rent Contract ID =================");
    log(rentContractId);
    log("================= Rent Contract ID =================");
    return rentContractId;
  } catch (error) {
    console.error("Error fetching rent contract ID:", error);
  }
}

// Reserve a node
async function reserveNode(client: GridClient, nodeId: number) {
  try {
    const reserved = await client.nodes.reserve({ nodeId });
    log("================= Reserve Nodes =================");
    log(reserved);
    log("================= Reserve Nodes =================");
    return reserved;
  } catch (error) {
    console.error("Error reserving node:", error);
  }
}

// Get a list of rentable nodes
async function getRentableNodes(client: GridClient) {
  try {
    const rentable = await client.capacity.filterNodes({ rentable: true });
    if (rentable.length > 0) {
      log("================= Rentable Nodes =================");
      log(rentable);
      log("================= Rentable Nodes =================");
      return rentable;
    } else {
      console.error("No rentable nodes available.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching rentable nodes:", error);
    return [];
  }
}

// Unreserve a node
async function unreserve(client: GridClient, nodeId: number) {
  try {
    const unreserved = await client.nodes.unreserve({ nodeId });
    log("================= Unreserved Node =================");
    log(unreserved);
    log("================= Unreserved Node =================");
  } catch (error) {
    console.error("Error unreserving node:", error);
  }
}

// Call the main function
main();
