import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

export interface QueryGetProposalOptions {
  proposalHash: string;
}

export interface Proposal {
  section: string;
  method: string;
  args: unknown;
}

class QueryCouncil {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async getProposal(options: QueryGetProposalOptions): Promise<Proposal> {
    const res = await this.client.api.query.council.proposalOf(options.proposalHash);
    return res.toHuman() as unknown as Proposal;
  }

  @checkConnection
  async getAllProposals(): Promise<string[]> {
    const res = await this.client.api.query.council.proposals();
    return res.toPrimitive() as string[];
  }

  @checkConnection
  async getProposalCount(): Promise<number> {
    const res = await this.client.api.query.council.proposalCount();
    return res.toPrimitive() as number;
  }
}

export interface CouncilProposeOptions<T> {
  proposal: ExtrinsicResult<T>;
  threshold: number;
}

export interface CouncilCloseProposalOptions {
  proposalHash: string;
  index: number;
}

export interface CouncilVoteOptions {
  proposalHash: string;
  index: number;
  approve: boolean;
}

class Council extends QueryCouncil {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async propose<T>(options: CouncilProposeOptions<T>) {
    const extrinsic = await this.client.api.tx.council.propose(options.threshold, options.proposal, 1000);
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async close(options: CouncilCloseProposalOptions) {
    const now = Math.floor(new Date().getTime() / 1000);
    const extrinsic = await this.client.api.tx.council.close(
      options.proposalHash,
      options.index,
      { refTime: +now, proofSize: 100000 },
      1000,
    );
    return this.client.patchExtrinsic(extrinsic);
  }

  @checkConnection
  async vote(options: CouncilVoteOptions) {
    const extrinsic = await this.client.api.tx.council.vote(options.proposalHash, options.index, options.approve);
    return this.client.patchExtrinsic(extrinsic);
  }
}

export { Council, QueryCouncil };
