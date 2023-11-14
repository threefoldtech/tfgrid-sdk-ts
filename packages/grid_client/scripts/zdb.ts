import { FilterOptions, ZDBModel, ZdbModes, ZDBSModel } from "../src";
import { getClient } from "./client_loader";
import { log } from "./utils";

async function deploy(client, zdb) {
  try {
    const res = await client.zdbs.deploy(zdb);
    log("================= Deploying ZDBs =================");
    log(res);
    log("================= Deploying ZDBs =================");
  } catch (error) {
    log("Error while Deploying the ZDBs " + error);
  }
}

async function getDeployment(client, zdb) {
  try {
    const res = await client.zdbs.getObj(zdb);
    log("================= Getting deployment information =================");
    log(res);
    log("================= Getting deployment information =================");
  } catch (error) {
    log("Error while getting the deployment " + error);
  }
}

async function cancel(client, zdb) {
  try {
    const res = await client.zdbs.delete(zdb);
    log("================= Canceling the deployment =================");
    log(res);
    log("================= Canceling the deployment =================");
  } catch (error) {
    log("Error while canceling the deployment " + error);
  }
}

async function main() {
  const grid3 = await getClient();

  const zdbQueryOptions: FilterOptions = {
    sru: 1,
    hru: 1,
    availableFor: grid3.twinId,
    farmId: 1,
  };

  // create zdb object
  const zdb = new ZDBModel();
  zdb.name = "hamada";
  zdb.node_id = +(await grid3.capacity.filterNodes(zdbQueryOptions))[0].nodeId;
  zdb.mode = ZdbModes.user;
  zdb.disk_size = 1;
  zdb.publicNamespace = false;
  zdb.password = "testzdb";

  // create zdbs object
  const zdbs = new ZDBSModel();
  zdbs.name = "tttzdbs";
  zdbs.zdbs = [zdb];
  zdbs.metadata = "";

  //Deploy ZDBs
  await deploy(grid3, zdbs);

  //Get the deployment
  await getDeployment(grid3, zdbs.name);

  //Uncomment the line below to cancel the deployment
  // await cancel(grid3, { name: zdbs.name });

  await grid3.disconnect();
}

main();
