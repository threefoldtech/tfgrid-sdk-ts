import type { Pagination } from "../builders/abstract_builder";
import { NodesBuilder, type NodesQuery } from "../builders/nodes";
import { resolvePaginator } from "../utils";
import { AbstractClient } from "./abstract_client";
import type { Farm, FarmsClient } from "./farms";
import type { GridNode } from "./gateways";

export interface NodesExtractOptions {
  loadFarm?: boolean;
}

export class NodesClient extends AbstractClient<NodesBuilder, NodesQuery> {
  public farms: Map<number, Farm>;

  constructor(uri: string, private readonly __farmsClient: FarmsClient) {
    super({
      uri,
      Builder: NodesBuilder,
    });

    this.farms = new Map<number, Farm>();
    this.setFarm = this.setFarm.bind(this);
  }

  public async list(queries: Partial<NodesQuery> = {}, extraOptions: NodesExtractOptions = {}) {
    const res = await this.builder(queries).build("/nodes");
    const nodes = await resolvePaginator<GridNode[]>(res);
    if (extraOptions.loadFarm) {
      await this.loadFarms(nodes.data.map(n => n.farmId));
      nodes.data = nodes.data.map(this.setFarm);
    }
    return nodes;
  }

  public async byId(nodeId: number, extraOptions: NodesExtractOptions = {}): Promise<GridNode> {
    const res = await this.builder({}).build(`/nodes/${nodeId}`);
    const node = await res.json();
    if (extraOptions.loadFarm && node) {
      await this.loadFarms([node.farmId]);
      return this.setFarm(node);
    }
    return node;
  }

  public async listAll(queries: Partial<NodesQuery> = {}) {
    const { count } = await this.list({
      ...queries,
      size: 50,
      page: 1,
      retCount: true,
    });
    const promises: Promise<Pagination<GridNode[]>>[] = [];
    const pages = Math.ceil(count! / 50);
    for (let i = 0; i < pages; i++) {
      promises.push(this.list({ ...queries, size: 50, page: i + 1 }));
    }
    const nodes = await Promise.all(promises);
    return nodes.map(node => node.data).flat(1);
  }

  private async loadFarms(farmIds: number[]): Promise<void> {
    farmIds = farmIds.filter(id => !this.farms.has(id));
    const ids = Array.from(new Set(farmIds));
    if (!ids.length) return;
    const farms = await Promise.all(ids.map(id => this.__farmsClient.list({ farmId: id })));
    for (const { data } of farms) {
      const [farm] = data;
      this.farms = this.farms.set(farm.farmId, farm);
    }
  }

  private setFarm(node: GridNode): GridNode {
    node.farm = this.farms.get(node.farmId)!;
    return node;
  }
}
