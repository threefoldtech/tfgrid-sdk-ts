import GridProxyClient, { ContractState } from "@threefold/gridproxy_client";

import { ContractStates, LockContracts } from "../src";
import { getClient } from "./client_loader";

async function getGracePeriodUsers(grid) {
  const proxy = new GridProxyClient(grid.config.proxyURL);
  let page = 1;
  const contracts: any[] = [];
  const twins = new Set();
  const users: any[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await proxy.contracts.list({ page, state: [ContractState.GracePeriod] });
    contracts.push(...data);

    contracts.map(c => {
      if (!twins.has(c.twin_id)) {
        twins.add(c.twin_id);
      }
    });

    for (const twin of twins) {
      const { data } = await proxy.twins.list({ page, twinId: twin as number });
      users.push(...data);
    }

    if (data.length < 50) {
      break;
    }
    page++;
  }

  return users;
}

async function getUserBalance(grid, address) {
  const balance = grid.balance.get(address);
  return balance;
}

async function getContractsLockedAmount(grid, accountId) {
  const LockedContracts: LockContracts = {
    nameContracts: {},
    nodeContracts: {},
    rentContracts: {},
    totalAmountLocked: 0,
  };

  const contracts = await grid.contracts.listContractsByAddress({
    accountId,
    stateList: [ContractStates.GracePeriod],
  });

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

  // get all users that has grace period contracts
  const users = await getGracePeriodUsers(grid);
  const unmatchedBalanceAccounts: any = [];
  for (const user of users) {
    // get user locked balance
    const balances = await getUserBalance(grid, { address: user.accountId });

    // get contracts locked balance
    const contractsLockedBalance = await getContractsLockedAmount(grid, user.accountId);

    if (balances.frozen != contractsLockedBalance) {
      unmatchedBalanceAccounts.push({
        twinId: user.twinId,
        lockedBalance: balances.frozen,
        lockedContractsBalance: contractsLockedBalance,
      });
    }
  }

  console.log({ unmatchedBalanceAccounts });
  await grid.disconnect();
})();
