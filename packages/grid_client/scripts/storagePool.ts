import { getClient } from "./client_loader";
import { log } from "./utils";
export interface StoragePool {
  type: string;
  size: number;
  used: number;
}
async function main() {
  const grid3 = await getClient();
  const nodeId = 11;

  try {
    let pool;
    try {
      pool = await grid3.capacity.checkNodeCapacityPool({
        nodeId,
        disks: [5990],
        rootfs_size: 500,
      });
    } catch {
      throw new Error(`Node ${nodeId} is not responding please select another node`);
    }
    // const poolGB = pool.flatMap((disk: StoragePool) => {
    //   return disk.type === "ssd" ? [(disk.size - disk.used) / 1024 ** 3] : [];
    // });
    // // const sum = pool.reduce((accumulator, currentValue) => {
    // //   return accumulator + currentValue
    // // },0);
    console.log(pool);
    // console.log(poolGB);
    // pool.sort((a, b) => b - a);
    // disks.sort((a, b) => a - b);
  } catch (e) {
    log(`Couldn't reach node ${nodeId} to get storage pools due to ${e}`);
  }

  await grid3.disconnect();
}

main();
