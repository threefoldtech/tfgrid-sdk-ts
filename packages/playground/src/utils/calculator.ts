import type { ApiPromise } from "@polkadot/api";

export async function getTFTPrice(api: { query: { tftPriceModule: { tftPrice: any } } }) {
  const pricing = await api.query.tftPriceModule.tftPrice();
  return pricing.words[0] / 1000;
}

export async function getPrices(api: ApiPromise) {
  const pricing = await api.query.tfgridModule.pricingPolicies(1);
  return pricing.toJSON();
}
export async function calcPrice(api: ApiPromise) {
  const price = await getPrices(api);
  return price;
}

export function calSU(hru: number, sru: number) {
  return hru / 1200 + sru / 200;
}

export function calCU(cru: number, mru: number) {
  const mru_used_1 = mru / 4;
  const cru_used_1 = cru / 2;
  const cu1 = mru_used_1 > cru_used_1 ? mru_used_1 : cru_used_1;

  const mru_used_2 = mru / 8;
  const cru_used_2 = cru;
  const cu2 = mru_used_2 > cru_used_2 ? mru_used_2 : cru_used_2;

  const mru_used_3 = mru / 2;
  const cru_used_3 = cru / 4;
  const cu3 = mru_used_3 > cru_used_3 ? mru_used_3 : cru_used_3;

  let cu = cu1 > cu2 ? cu2 : cu1;
  cu = cu > cu3 ? cu3 : cu;

  return cu;
}
