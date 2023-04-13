import { ApiPromise, WsProvider } from "@polkadot/api";
import config from "../config";

export async function connect() {
  const wsProvider = new WsProvider(config.wsUrl);
  const api = await ApiPromise.create({ provider: wsProvider });
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);
  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
  return api;
}
