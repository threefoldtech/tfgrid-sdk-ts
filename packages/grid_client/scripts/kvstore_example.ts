import { getClient } from "./client_loader";
import { log } from "./utils";

async function setKey(client, key) {
  try {
    const res = await client.kvstore.set(key);
    log("================= Setting the key =================");
    log(res);
    log("================= Setting the key =================");
  } catch (error) {
    console.error("Error while setting the key ", error.message);
  }
}

async function listAllKeys(client) {
  try {
    const res = await client.kvstore.list();
    log("================= Listing all keys =================");
    log(res);
    log("================= Listing all keys =================");
  } catch (error) {
    console.error("Error while listing keys ", error.message);
  }
}

async function getKey(client, key) {
  try {
    const res = await client.kvstore.get(key);
    log("================= Getting key =================");
    log(res);
    log("================= Getting key =================");
  } catch (error) {
    console.error("Error while getting key ", error.message);
  }
}

async function removeKey(client, key) {
  try {
    const res = await client.kvstore.remove(key);
    log("================= Removing key =================");
    log(res);
    log("================= Removing key =================");
  } catch (error) {
    console.error("Error while removing key ", error.message);
  }
}

/*
KVStore example usage:
*/
async function main() {
  //For creating grid3 client with KVStore, you need to specify the KVStore storage type in the pram:

  const gridClient = await getClient();

  //then every module will use the KVStore to save its configuration and restore it.

  // set key
  const key = "hamada";
  const exampleObj = {
    key1: "value1",
    key2: 2,
  };

  //Set key
  await setKey(gridClient, { key, value: JSON.stringify(exampleObj) });

  //List all keys
  await listAllKeys(gridClient);

  //Get key
  await getKey(gridClient, { key });

  //Remove key
  await removeKey(gridClient, { key });

  await gridClient.disconnect();
}

main();
