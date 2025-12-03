import { NodesBuilder, type NodesQuery } from "../builders/nodes";
import { resolvePaginator } from "../utils";
import { AbstractClient } from "./abstract_client";
import type { Farm, FarmsClient } from "./farms";
import type { GPUCard, GridNode, NodeStats, PublicIps } from "./gateways";
import type { Twin, TwinsClient } from "./twins";

export interface NodesExtractOptions {
  loadFarm?: boolean;
  loadTwin?: boolean;
  loadStats?: boolean;
}

export class NodesClient extends AbstractClient<NodesBuilder, NodesQuery> {
  public farms: Map<number, Farm>;
  public twins: Map<number, Twin>;

  constructor(
    uri: string,
    private readonly __farmsClient: FarmsClient,
    private readonly __twinsClient: TwinsClient,
  ) {
    super({
      uri,
      Builder: NodesBuilder,
    });

    this.farms = new Map<number, Farm>();
    this.setFarm = this.setFarm.bind(this);

    this.twins = new Map<number, Twin>();
    this.setTwin = this.setTwin.bind(this);
  }

  public async list(queries: Partial<NodesQuery> = {}, extraOptions: NodesExtractOptions = {}, signal?: AbortSignal) {
    const res = await this.builder(queries).build("/nodes", 10000, signal);
    const nodes = await resolvePaginator<GridNode[]>(res);

    if (extraOptions.loadFarm) {
      await this.loadFarms(
        nodes.data.map(n => n.farmId),
        signal,
      );
      nodes.data = nodes.data.map(this.setFarm);
    }

    if (extraOptions.loadTwin) {
      await this.loadTwins(
        nodes.data.map(n => n.twinId),
        signal,
      );
      nodes.data = nodes.data.map(this.setTwin);
    }

    if (extraOptions.loadStats) {
      const nodesStats = await Promise.all(nodes.data.map(n => this.statsById(n.nodeId, signal)));
      nodes.data = nodes.data.map((n, index) => {
        n.stats = nodesStats[index];
        return n;
      });
    }

    return nodes;
  }

  public async byId(nodeId: number, extraOptions: NodesExtractOptions = {}, signal?: AbortSignal): Promise<GridNode> {
    const res = await this.builder({}).build(`/nodes/${nodeId}`, 10000, signal);
    let node: GridNode = await res.json();

    const capacity = Reflect.get(node, "capacity");
    if (capacity) {
      node.total_resources = Reflect.get(capacity, "total_resources");
      node.used_resources = Reflect.get(capacity, "used_resources");
    }

    if (extraOptions.loadFarm && node) {
      await this.loadFarms([node.farmId], signal);
      node = this.setFarm(node);
    }

    if (extraOptions.loadTwin) {
      await this.loadTwins([node.twinId], signal);
      node = this.setTwin(node);
    }

    if (extraOptions.loadStats) {
      node.stats = await this.statsById(node.nodeId, signal);
    }

    return node;
  }

  public async statsById(nodeId: number, signal?: AbortSignal): Promise<NodeStats> {
    const res = await this.builder({}).build(`/nodes/${nodeId}/statistics`, 10000, signal);
    return res.json();
  }

  public async gpuById(nodeId: number, signal?: AbortSignal): Promise<GPUCard[] | null | { error: string }> {
    const res = await this.builder({}).build(`/nodes/${nodeId}/gpu`, 10000, signal);
    return res.json();
  }

  private async loadFarms(farmIds: number[], signal?: AbortSignal): Promise<void> {
    farmIds = farmIds.filter(id => !this.farms.has(id));
    const ids = Array.from(new Set(farmIds));
    if (!ids.length) return;
    const farms = await Promise.all(ids.map(farmId => this.__farmsClient.list({ farmId }, signal)));
    for (const { data } of farms) {
      const [farm] = data;
      this.farms = this.farms.set(farm.farmId, farm);
    }
  }

  private setFarm(node: GridNode): GridNode {
    const farm = this.farms.get(node.farmId);
    if (farm) {
      node.farm = farm;
      node.publicIps = this.getFarmPublicIps(farm);
    }
    return node;
  }

  private getFarmPublicIps(farm: Farm): PublicIps {
    const total = farm.publicIps.length;
    const free = farm.publicIps.filter(({ contract_id }) => contract_id === 0).length;
    return {
      total,
      used: total - free,
      free,
    };
  }

  private async loadTwins(twinIds: number[], signal?: AbortSignal): Promise<void> {
    twinIds = twinIds.filter(id => !this.twins.has(id));
    const ids = Array.from(new Set(twinIds));
    if (!ids.length) return;
    const twins = await Promise.all(ids.map(twinId => this.__twinsClient.list({ twinId }, signal)));
    for (const { data } of twins) {
      const [twin] = data;
      this.twins = this.twins.set(twin.twinId, twin);
    }
  }

  private setTwin(node: GridNode): GridNode {
    const twin = this.twins.get(node.twinId);
    if (twin) {
      node.twin = twin;
    }
    return node;
  }
}
