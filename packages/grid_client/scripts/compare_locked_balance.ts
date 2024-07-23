import GridProxyClient from "@threefold/gridproxy_client";

import { ContractStates, LockContracts } from "../src";
import { getClient } from "./client_loader";

async function getAllUsers() {
  const proxy = new GridProxyClient("https://gridproxy.grid.tf");
  const users = await proxy.twins.list();
  return users.data;
}

async function getUserBalance(grid, address) {
  const balance = grid.balance.get(address);
  return balance;
}

async function getContractsLockedAmount(grid, twinId) {
  const LockedContracts: LockContracts = {
    nameContracts: {},
    nodeContracts: {},
    rentContracts: {},
    totalAmountLocked: 0,
  };

  const contracts = await grid.contracts.listContractsByTwinId({
    twinId,
    stateList: [ContractStates.GracePeriod],
  });

  console.log("contractssss", contracts);

  if (contracts == undefined) return 0;

  const contractTypes = ["nameContracts", "nodeContracts", "rentContracts"];

  for (const type of contractTypes) {
    for (const contract of contracts[type]) {
      const contractID = parseInt(contract.contractID);
      const contractLockDetails = await grid.contracts.contractLock({ id: contractID });
      LockedContracts[type][contractID] = contractLockDetails;
      LockedContracts.totalAmountLocked += contractLockDetails.amountLocked;
    }
  }
  return LockedContracts.totalAmountLocked;
}

(async function main() {
  const grid = await getClient();
  await grid.tfclient.connect();

  // get all twins via gridproxy
  const users = await getAllUsers();
  const unmatchedBalanceAccount: any = [];
  for (const user in users) {
    // get each user locked balance
    const balances = await getUserBalance(grid, { address: users[user].accountId });
    const contractsLocked = await getContractsLockedAmount(grid, users[user].twinId);

    if (balances.frozen != contractsLocked) {
      unmatchedBalanceAccount.push({
        twinId: users[user].twinId,
        accountId: users[user].accountId,
        lockedBalance: balances.frozen,
        lockedContractsBalance: contractsLocked,
      });
    }
  }

  console.log({ unmatchedBalanceAccount });
  await grid.disconnect();
})();
