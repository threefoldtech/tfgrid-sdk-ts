import { ApiPromise, WsProvider } from "@polkadot/api";
import types from "@/types.json";
const URL = window.configs.APP_API_URL;

function _toString(bytes: ArrayLike<number>): string {
  return Array.from(bytes, byte => String.fromCharCode(byte)).join("");
}

export default function getPricingPolicies(): Promise<Map<number, string>> {
  const provider = new WsProvider(URL);

  return ApiPromise.create({ provider, types })
    .then((api: any) => {
      return api.query.tfgridModule.pricingPolicies.entries();
    })
    .then(([x]: any) => {
      return x.slice(1).reduce(
        (
          map: any,
          {
            id: {
              words: [id],
            },
            name,
          }: any,
        ) => {
          return map.set(id, _toString(name));
        },
        new Map<number, string>(),
      );
    });
}
