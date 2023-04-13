import { PortalState } from "./state";
import type { ActionContext } from "vuex";
import { web3Enable, web3AccountsSubscribe } from "@polkadot/extension-dapp";
import { getProposal, getProposals } from "../lib/dao";
import { getFarm } from "../lib/farms";

export default {
  async subscribeAccounts({ commit }: ActionContext<PortalState, PortalState>) {
    await web3Enable("TF Chain UI");
    await web3AccountsSubscribe(injectedAccounts => {
      commit("setAccounts", { accounts: injectedAccounts });
    });
  },
  async unsubscribeAccounts({ commit }: ActionContext<PortalState, PortalState>) {
    const unsubscribe = await web3AccountsSubscribe(() => {
      console.log(`unsubscribing`);
    });
    unsubscribe && unsubscribe();
    commit("removeAccounts");
  },
  async getProposal({ commit, state }: ActionContext<PortalState, PortalState>, twin: number) {
    const active = (await getProposals(state.api)).active;
    if (!active.length) return;
    const farms = await getFarm(state.api, parseFloat(`${twin}`));

    // only users who own a farm should get the notification
    if (!farms.length) {
      commit("setProposals", { proposals: 0 });
      return;
    }
    const farmIds = farms.map(function (value) {
      return value.id;
    });

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
    commit("setProposals", { proposals: active.length });
  },
};
