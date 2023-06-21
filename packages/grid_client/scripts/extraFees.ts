import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
  const grid3 = await getClient();

  const node = { nodeId: 5 };

  const extraFees = await grid3.contracts.setExtraFees({ ...node, extraFee: 5 });

  console.log(extraFees);

  grid3.contracts
    .getDedicatedNodePrice(node)
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
