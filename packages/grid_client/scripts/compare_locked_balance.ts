import TFGridGqlClient from "@threefold/graphql_client";
import { ContractState } from "@threefold/gridproxy_client";

import { BalanceGetModel, GridClient } from "../src";
import { getClient } from "./client_loader";

interface Contract {
  contractID: string;
  state: string;
}
async function getUsersWithContracts(grid: GridClient) {
  const users: any[] = [];

  const graphql = new TFGridGqlClient(grid.config.graphqlURL);

  const [nodeContracts, nameContracts, rentContracts] = await Promise.all([
    graphql.nodeContracts(
      { twinID: true, contractID: true, state: true },
      {
        where: {
          state_in: [ContractState.Created, ContractState.GracePeriod],
        },
      },
    ),
    graphql.nameContracts(
      { twinID: true, contractID: true, state: true },
      {
        where: {
          state_in: [ContractState.Created, ContractState.GracePeriod],
        },
      },
    ),
    graphql.rentContracts(
      { twinID: true, contractID: true, state: true },
      {
        where: {
          state_in: [ContractState.Created, ContractState.GracePeriod],
        },
      },
    ),
  ]);

  const contracts = [...nodeContracts, ...nameContracts, ...rentContracts];

  for (const contract of contracts) {
    const twin = await graphql.twins({ accountID: true }, { where: { twinID_eq: +contract.twinID } });
    let user = users.find(user => user.twinID === contract.twinID);

    if (!user) {
      user = {
        twinID: contract.twinID,
        accountID: twin[0]?.accountID,
        contracts: [],
      };

      // Some twins don't have account ID, that's why they're not included in the users arr
      if (user.accountID) {
        users.push(user);
      }
    }

    user.contracts.push({
      contractID: contract.contractID,
      state: contract.state,
    });
  }

  return users;
}

async function getUserBalance(grid: GridClient, address: BalanceGetModel) {
  const balance = grid.balance.get(address);
  return balance;
}

async function getContractsLockedAmount(grid: GridClient, contracts: Contract[]) {
  let totalAmountLocked = 0;

  for (const contract of contracts) {
    const contractLockDetails = await grid.contracts.contractLock({ id: +contract.contractID });
    totalAmountLocked += contractLockDetails.amountLocked + contractLockDetails.extraAmountLocked;
  }

  return totalAmountLocked;
}

(async function main() {
  const grid = await getClient();
  await grid.tfclient.connect();

  // get all users that has grace period & created contracts
  const users = await getUsersWithContracts(grid);

  const unmatchedBalanceAccounts: any[] = [];

  for (const user of users) {
    // get user locked balance
    const balances = await getUserBalance(grid, { address: user.accountID });

    // get contracts locked balance
    const contractsLockedBalance = await getContractsLockedAmount(grid, user.contracts);

    // if frozen balance != locked balance, push to unmatched accounts
    if (balances.frozen != contractsLockedBalance) {
      unmatchedBalanceAccounts.push({
        ...user,
        lockedBalance: balances.frozen,
        lockedContractsBalance: contractsLockedBalance,
      });
    }
  }

  console.dir(unmatchedBalanceAccounts, { depth: null, colors: true });
  await grid.disconnect();
})();
