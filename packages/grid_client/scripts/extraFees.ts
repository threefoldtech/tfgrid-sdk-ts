import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  const node = { nodeId: 73 };

  const extraFees = await grid3.contracts.setDedicatedNodeExtraFee({ ...node, extraFee: 5 });

  console.log(extraFees);

  grid3.contracts
    .getDedicatedNodeExtraFee(node)
    .then(res => {
      log(res);
    })
    .catch(err => {
      throw err;
    })
    .finally(() => {
      grid3.disconnect();
    });
}

main();
