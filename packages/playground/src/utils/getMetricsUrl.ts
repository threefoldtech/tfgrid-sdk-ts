import type { GridClient } from "@threefold/grid_client";

import type { Machine } from "./deploy_vm";

export interface IGrafanaArgs {
  orgID: number;
  network: string;
  farmID: number;
  accountID: string;
}

export class GrafanaStatistics implements IGrafanaArgs {
  public orgID = 2;
  public network = "";
  public farmID = 0;
  public accountID = "";
  public grid: GridClient;
  public deployment: any;

  constructor(grid: GridClient, deployment: any) {
    this.grid = grid;
    this.deployment = deployment;
    this.network = grid.clientOptions?.network || "dev";
  }

  async setAccountID() {
    await this.grid.twins.get({ id: this.deployment[0].nodeId }).then(res => {
      this.accountID = res.accountId;
    });
  }

  async setfarmID() {
    await this.grid.nodes.getRent({ nodeId: this.deployment[0].nodeId }).then(res => {
      this.farmID = res.farmId;
    });
  }

  async getUrl() {
    await this.setfarmID();
    await this.setAccountID();
    this.updateNetwork();
    const orgId = `orgId=${this.orgID}`;
    const network = `var-network=${this.network}`;
    const farmID = `var-farm=${this.farmID}`;
    const nodeID = `var-node=${this.accountID}`;

    const urlArgs = `${orgId}&refresh=30s&${network}&${farmID}&${nodeID}&var-diskdevices=%5Ba-z%5D%2B%7Cnvme%5B0-9%5D%2Bn%5B0-9%5D%2B%7Cmmcblk%5B0-9%5D%2B`;
    const url = `https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics?${urlArgs}`;
    return url;
  }

  public updateNetwork() {
    if (this.network.length) {
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
    } else {
      throw Error("Can not get the network from the GridClient Options");
    }
  }
}
