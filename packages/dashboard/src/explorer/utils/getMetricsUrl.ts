import config from "@/portal/config";

import { INode } from "../graphql/api";

export type GrafanaArgsType = {
  orgID: number;
  network: string;
  farmID: number;
  twinID: number;
  accountID: string;
};

export class GrafanaStatistics {
  public args: GrafanaArgsType = {
    orgID: 2,
    network: config.network,
    twinID: 0,
    farmID: 0,
    accountID: "",
  };

  constructor(node: INode, accountID: string) {
    this.args.twinID = node.twinId;
    this.args.farmID = node.farmId;
    this.args.accountID = accountID;
    this.updateNetwork();
  }

  public getUrl(): string {
    const orgId = `orgId=${this.args.orgID}`;
    const network = `var-network=${this.args.network}`;
    const farmID = `var-farm=${this.args.farmID}`;
    const nodeID = `var-node=${this.args.accountID}`;

    const urlArgs = `${orgId}&refresh=30s&${network}&${farmID}&${nodeID}&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B`;
    return `https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?${urlArgs}`;
  }

  public updateNetwork() {
    switch (this.args.network) {
      case "dev":
        this.args.network = "development";
        break;
      case "qa":
        this.args.network = "qa";
        break;
      case "test":
        this.args.network = "testing";
        break;
      case "main":
        this.args.network = "production";
        break;
    }
  }
}
