import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

class QueryCouncilMembership {
  constructor(public client: QueryClient) {
    this.client = client;
  }
  @checkConnection
  async members(): Promise<string[]> {
    const res = await this.client.api.query.councilMembership.members();
    return res.toPrimitive() as string[];
  }
}
class CouncilMembership extends QueryCouncilMembership {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }
}
export { CouncilMembership, QueryCouncilMembership };
