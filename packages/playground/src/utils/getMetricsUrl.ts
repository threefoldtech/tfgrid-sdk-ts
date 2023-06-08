import type { GridClient } from "@threefold/grid_client";

export interface IGrafanaArgs {
  orgID: number;
  farmID: number;
  network: string;
  accountID: string;
}

export class GrafanaStatistics implements IGrafanaArgs {
  public orgID = 2;
  public network = "";
  public accountID = "";
  public grid: GridClient;
  public deployment: any;
  public farmID: number;

  constructor(grid: GridClient, deployment: any) {
    this.grid = grid;
    this.deployment = deployment;
    this.network = grid.clientOptions?.network || "dev";
    this.farmID = 0;
  }

  async setNodeAccountID() {
    if (this.deployment.length && this.deployment[0]["nodeId"]) {
      const node = await this.grid.nodes.get({ id: this.deployment[0].nodeId });
      if (node) {
        await this.grid.twins.get({ id: node.twinId }).then(res => {
          this.accountID = res.accountId;
          this.farmID = node.farmId;
        });
      }
    }
  }

  async getUrl() {
    await this.setNodeAccountID();
    this.updateNetwork();
    const orgId = `orgId=${this.orgID}`;
    const network = `var-network=${this.network}`;
    const farmID = `var-farm=${this.farmID}`;
    const nodeID = `var-node=${this.accountID}`;

    const urlArgs = `${orgId}&refresh=30s&${network}&${farmID}&${nodeID}`;
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
