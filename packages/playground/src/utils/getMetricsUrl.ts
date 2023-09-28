import GridProxyClient, { type GridNode, type TwinsQuery } from "@threefold/gridproxy_client";

export interface IGrafanaArgs {
  farmID: number;
  twinID: number;
  accountID: string;
}

export class GrafanaStatistics {
  private client: GridProxyClient;
  private network: string;
  public farmID: number;
  public twinID: number;
  public accountID: string;
  private orgID: number;
  private node: GridNode;

  constructor(node: GridNode, orgID = 2) {
    this.node = node;
    const network = process.env.NETWORK || (window as any).env.NETWORK;
    const client = new GridProxyClient(network);
    this.client = client;
    this.twinID = node.twinId;
    this.farmID = node.farmId;
    this.network = process.env.NETWORK || (window as any).env.NETWORK;
    this.updateNetwork();
    this.orgID = orgID;
    this.accountID = "";
  }

  private async getAccountID() {
    const twinsListParams: Partial<TwinsQuery> = {
      twinId: this.node.twinId,
    };

    const twins = await this.client.twins.list(twinsListParams);
    if (twins.data.length > 0) {
      this.accountID = twins.data[0].accountId;
    }
  }

  private updateNetwork() {
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
      // Add a default case to handle other network values
      default:
        break;
    }
  }

  public async getUrl(): Promise<string> {
    await this.getAccountID();
    const url = new URL("https://metrics.grid.tf/d/rYdddlPWkfqwf/zos-host-metrics");
    const params = new URLSearchParams();
    params.set("orgId", this.orgID.toString());
    params.set("refresh", "30s");
    params.set("var-network", this.network);
    params.set("var-farm", this.farmID.toString());
    params.set("var-node", this.accountID);
    params.set("var-diskdevices", "[a-z]+|nvme[0-9]+n[0-9]+|mmcblk[0-9]+");

    url.search = params.toString();
    return url.toString();
  }
}
