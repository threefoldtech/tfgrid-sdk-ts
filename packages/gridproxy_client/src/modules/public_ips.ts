import type { Pagination } from "../builders/abstract_builder";
import { PublicIpBuilder, PublicIpQuery } from "../builders/public_api";
import { resolvePaginator } from "../utils";
import { AbstractClient } from "./abstract_client";
import { PublicIp } from "./farms";

export class PublicIpsClient extends AbstractClient<PublicIpBuilder, PublicIpQuery> {
  constructor(uri: string) {
    super({
      uri,
      Builder: PublicIpBuilder,
    });
  }

  public async list(queries: Partial<PublicIpQuery> = {}) {
    const res = await this.builder(queries).build("/public_ips");
    return resolvePaginator<PublicIp[]>(res);
  }

  public async listAll(queries: Partial<PublicIpQuery> = {}) {
    const { count } = await this.list({
      ...queries,
      size: 50,
      page: 1,
      retCount: true,
    });
    const promises: Promise<Pagination<PublicIp[]>>[] = [];
    const pages = Math.ceil(count! / 50);
    for (let i = 0; i < pages; i++) {
      promises.push(this.list({ ...queries, size: 50, page: i + 1 }));
    }
    const publicIps = await Promise.all(promises);
    return publicIps.map(node => node.data).flat(1);
  }
}
