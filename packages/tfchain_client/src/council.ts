import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

export interface QueryGetProposalOptions {
  proposalHash: string;
}

export interface ProposalDetails {
  section: string;
  method: string;
  args: unknown;
}

class QueryCouncil {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async getProposal(options: QueryGetProposalOptions): Promise<ProposalDetails> {
    const res = await this.client.api.query.council.proposalOf(options.proposalHash);
    return res.toHuman() as unknown as ProposalDetails;
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

export interface Proposal {
  address: string;
  index: number;
  proposalHash: string;
  threshold: number;
}

class Council extends QueryCouncil {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async propose<T>(options: CouncilProposeOptions<T>) {
    const extrinsic = await this.client.api.tx.council.propose(options.threshold, options.proposal, 1000);
    return this.client.patchExtrinsic<Proposal>(extrinsic, {
      map: res => {
        const result: Proposal = {
          address: res?.[0],
          index: res?.[1],
          proposalHash: res?.[2],
          threshold: res?.[3],
        };
        return result;
      },
    });
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
