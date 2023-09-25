import { assertIn } from "../utils";
import { ContractsClient } from "./contracts";
import { FarmsClient } from "./farms";
import { GatewaysClient } from "./gateways";
import { NodesClient } from "./nodes";
import { StatsClient } from "./stats";
import { TwinsClient } from "./twins";

export enum Network {
  Main = "main",
  Test = "test",
  Dev = "dev",
  Qa = "qa",
}

export default class GridProxyClient {
  private readonly __uri: string;

  public get uri(): string {
    return this.__uri;
  }

  constructor(network: Network) {
    assertIn(network, [Network.Main, Network.Test, Network.Dev, Network.Qa]);

    this.__uri = network === Network.Main ? "https://gridproxy.grid.tf" : `https://gridproxy.${network}.grid.tf`;

    this.contracts = new ContractsClient(this.__uri);
    this.farms = new FarmsClient(this.__uri);
    this.gateways = new GatewaysClient(this.__uri);
    this.twins = new TwinsClient(this.__uri);
    this.nodes = new NodesClient(this.__uri, this.farms, this.twins);
    this.stats = new StatsClient(this.__uri);
  }

  public contracts: ContractsClient;
  public farms: FarmsClient;
  public gateways: GatewaysClient;
  public nodes: NodesClient;
  public stats: StatsClient;
  public twins: TwinsClient;
}
