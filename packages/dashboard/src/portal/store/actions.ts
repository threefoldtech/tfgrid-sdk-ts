import { web3AccountsSubscribe, web3Enable } from "@polkadot/extension-dapp";
import type { ActionContext } from "vuex";

import { getProposals } from "../lib/dao";
import { getFarm } from "../lib/farms";
import { updateDedicatedNodes } from "../lib/nodes";
import { MutationTypes } from "./mutations";
import { PortalState } from "./state";

export enum ActionTypes {
  REQUEST_DEDICATED_NODES = "requestDedicatedNodes",
}

export default {
  async subscribeAccounts({ commit }: ActionContext<PortalState, PortalState>) {
    const extensions = await web3Enable("TF Chain UI");
    await web3AccountsSubscribe(injectedAccounts => {
      commit(MutationTypes.SET_ACCOUNTS, { accounts: injectedAccounts });
    });
    return extensions.length;
  },

  async requestDedicatedNodes({ state, commit }: ActionContext<PortalState, PortalState>) {
    commit(MutationTypes.SET_TABLE_LOAD, true);
    let baseUrl = `${window.configs.APP_GRIDPROXY_URL}/nodes?status=up&ret_count=true&page=${state.dedicatedNodesTablePageNumber}&size=${state.dedicatedNodesTablePageSize}`;
    const query = state.tabQuery; // tab query.

    if (query == "rented_by") {
      baseUrl += `&${query}=${state.twinID}`;
    } else {
      baseUrl += `&${query}=true`;
    }

    for (const key in state.dedicatedNodesFilter) {
      let value = state.dedicatedNodesFilter[key];
      if (key == "total_hru" || key == "total_mru" || key == "total_sru") {
        value *= 1024 * 1024 * 1024; // convert from gb to b
        value = Math.ceil(value);
        value = parseInt(value);
      }
      // don't break the call for the null values
      if (value == null || value == undefined || value == 0) value = "";
      baseUrl += `&${key}=${value}`;
    }

    if (query.length) {
      try {
        const res = await fetch(baseUrl);
        const nodesCount: any = res.headers.get("count");
        commit(MutationTypes.SET_DEDICATED_NODES_COUNT, +nodesCount);
        let nodes = await res.json();
        // Update the nodes with price and discount.
        nodes = await updateDedicatedNodes(state.api, state.address, state.twinID, nodes);
        commit(MutationTypes.SET_DEDICATED_NODES, nodes);
      } catch (error) {
        console.error("Failed to fetch dedicated nodes:", error);
        // Handle error and show error message to the user
      }
    }
    commit(MutationTypes.SET_TABLE_LOAD, false);
  },

  async unsubscribeAccounts({ commit }: ActionContext<PortalState, PortalState>) {
    const unsubscribe = await web3AccountsSubscribe(() => {
      console.log(`unsubscribing`);
    });
    unsubscribe && unsubscribe();
    commit(MutationTypes.REMOVE_ACCOUNTS);
  },

  async getProposal({ commit, state }: ActionContext<PortalState, PortalState>, twin: number) {
    if (state.api) {
      try {
        const active = (await getProposals(state.api)).active;
        if (!active.length) return;
        const farms = await getFarm(state.api, parseFloat(`${twin}`));
        // only users who own a farm should get the notification
        if (!farms.length) {
          commit(MutationTypes.SET_PROPOSALS, { proposals: 0 });
          return;
        }
        const farmIds = farms.map(value => value.id);

        const voted: number[] = [];
        active.forEach((proposal, index) => {
          let inYes = false;
          proposal.ayes.forEach(({ farmId }) => {
            if (farmIds.includes(farmId)) {
              inYes = true;
              voted.push(index);
              return;
            }
          });
          if (inYes) return;
          proposal.nayes.forEach(({ farmId }) => {
            if (farmIds.includes(farmId)) {
              voted.push(index);
              return;
            }
          });
        });
        voted.forEach(index => {
          active.splice(index, 1);
        });
        commit(MutationTypes.SET_PROPOSALS, { proposals: active.length });
      } catch (error) {
        console.error("Failed to get proposal:", error);
        // Handle error and show error message to the user
      }
    }
  },
};
