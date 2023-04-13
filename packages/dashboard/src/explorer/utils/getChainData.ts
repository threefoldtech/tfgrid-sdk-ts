import { IState } from "../store/state";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ActionContext } from "vuex";

export default async function getChainData({ state }: ActionContext<IState, IState>) {
  const URL = window.configs.APP_API_URL;
  const provider = new WsProvider(URL);
  const pricingPolicies = await getPricingPolicies(provider);
  const { specName, specVersion } = await getSpecData(provider);
  const proxyVersion = await fetch(window.configs.APP_GRIDPROXY_URL + "/version")
    .then<{ version: string }>(res => res.json())
    .then(({ version: value }) => ({ name: "Grid Proxy", value }));

  state.pricingPolicies = pricingPolicies;
  state.versions = [
    {
      name: "Explorer",
      value: window.configs.APP_VERSION,
    },
    proxyVersion,
    { name: "Chain", value: `${specName} v${specVersion}` },
  ];

  provider.disconnect();
}

function getPricingPolicies(provider: WsProvider): Promise<Map<number, string>> {
  return ApiPromise.create({ provider })
    .then(api => {
      return api.query.tfgridModule.pricingPolicies.entries();
    })
    .then(([x]) => x[1].toHuman())
    .then((certs: any) => {
      const map = new Map();
      certs = Array.isArray(certs) ? certs : [certs];
      for (const { id, name } of certs) {
        map.set(id, name);
      }
      return map;
    });
}

function getSpecData(wsProvider: WsProvider) {
  return ApiPromise.create({ provider: wsProvider }).then(api => {
    return api.query.system.lastRuntimeUpgrade().then((result: any) => {
      const { specName, specVersion } = result?.toJSON() as {
        specName: string;
        specVersion: number;
      };
      return { specName, specVersion };
    });
  });
}
