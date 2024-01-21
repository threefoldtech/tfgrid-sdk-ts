import { ILivenessChecker } from "src/types";

import { GraphQlHealthCheck } from "./graphql";
import { GridProxyHealthCheck } from "./gridproxy";
import { RMBHealthCheck } from "./rmb";
import { TFChainHealthCheck } from "./tfChain";

export async function servicesLiveChecker(
  GraphQlURL?: string,
  GridProxyURL?: string,
  TFChainURL?: string,
  RMBrelayURL?: string,
) {
  const LIVENESS = {};

  if (GraphQlURL) {
    LIVENESS["GraphQl"] = (await HealthChecker(new GraphQlHealthCheck(GridProxyURL))) ? "Alive" : `Down`;
  }
  if (GridProxyURL) {
    LIVENESS["GridProxy"] = (await HealthChecker(new GridProxyHealthCheck(GridProxyURL))) ? "Alive" : `Down`;
  }
  if (TFChainURL) {
    LIVENESS["TFChain"] = (await HealthChecker(new TFChainHealthCheck(TFChainURL))) ? "Alive" : "Down";
  }
  if (RMBrelayURL && TFChainURL) {
    LIVENESS["RMB"] = (await HealthChecker(new RMBHealthCheck(RMBrelayURL, TFChainURL, "sr25519"))) ? "Alive" : "Down";
  }
  return LIVENESS;
}

async function HealthChecker(HealthChecker: ILivenessChecker, retries = 2) {
  let alive = false;
  while (!alive && retries > 0) {
    alive = await HealthChecker.LiveChecker();
    retries--;
  }
  if ("disconnectHandler" in HealthChecker) HealthChecker.disconnectHandler();
  return alive;
}
