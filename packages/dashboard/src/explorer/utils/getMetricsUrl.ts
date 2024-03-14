import config from "@/portal/config";

import { INode } from "../graphql/api";

export interface IGrafanaArgs {
  orgID: number;
  network: string;
  farmID: number;
  twinID: number;
  accountID: string;
}

export class GrafanaStatistics implements IGrafanaArgs {
  public orgID = 2;
  public network: string = config.network;
  public farmID = 0;
  public twinID = 0;
  public accountID = "";

  constructor(node: INode, accountID: string) {
    this.twinID = node.twinId;
    this.farmID = node.farmId;
    this.accountID = accountID;
    this.updateNetwork();
  }

  public getUrl(): string {
    const orgId = `orgId=${this.orgID}`;
    const network = `var-network=${this.network}`;
    const farmID = `var-farm=${this.farmID}`;
    const nodeID = `var-node=${this.accountID}`;

    const urlArgs = `${orgId}&refresh=30s&${network}&${farmID}&${nodeID}&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B`;
    return `https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?${urlArgs}`;
  }

  public updateNetwork() {
    switch (this.network) {
      case "dev":
        this.network = "development";
        break;
      case "qa":
        this.network = "qa";
        break;
      case "test":
        this.network = "testing";
        break;
      case "main":
        this.network = "production";
        break;
    }
  }
}
