import { SubmittableExtrinsic } from "@polkadot/api-base/types";
import { ISubmittableResult } from "@polkadot/types/types";

import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";

export interface QueryGetProposalOptions {
  hash: string;
}

class QueryCouncil {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async getProposal(options: QueryGetProposalOptions) {
    const res = await this.client.api.query.council.proposalOf(options.hash);
    return res;
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

export interface CouncilProposeOptions {
  proposal: SubmittableExtrinsic<"promise", ISubmittableResult>;
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
  async propose(options: CouncilProposeOptions) {
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
