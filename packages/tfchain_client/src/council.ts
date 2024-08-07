import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";

export interface CouncilGetProposalOptions {
  hash: string;
}

export interface CouncilProposalDetails {
  section: string;
  method: string;
  args: unknown;
}

class QueryCouncil {
  constructor(public client: QueryClient) {
    this.client = client;
  }
  /**
   * Retrieves information about a council proposal based on the provided options.
   *
   * @param options - The options to specify which proposal to retrieve.
   * @returns A Promise that resolves to the proposal information.
   */
  @checkConnection
  async getProposal(options: CouncilGetProposalOptions): Promise<CouncilProposalDetails> {
    const res = await this.client.api.query.council.proposalOf(options.hash);
    return res.toHuman() as unknown as CouncilProposalDetails;
  }

  /**
   * Retrieves all council proposal hashes.
   *
   * @returns A Promise that resolves to all proposal hashes.
   */
  @checkConnection
  async getAllProposals(): Promise<string[]> {
    const res = await this.client.api.query.council.proposals();
    return res.toPrimitive() as string[];
  }

  /**
   * Retrieves the council proposals count.
   *
   * @returns A Promise that resolves to the proposals count.
   */
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
  hash: string;
  index: number;
}

export interface CouncilVoteOptions {
  hash: string;
  index: number;
  approve: boolean;
}

export interface CouncilProposal {
  address: string;
  index: number;
  hash: string;
  threshold: number;
}

class Council extends QueryCouncil {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  /**
   * Create a new council proposal extrinsic.
   *
   * @param options - The options for creating a new proposal.
   * @param options.proposal - The proposed extrinsic call.
   * @param options.threshold - The minimum number of the council members to vote on the proposal.
   * @returns A promise that resolves to the created proposal extrinsic.
   */
  @checkConnection
  async propose<T>(options: CouncilProposeOptions<T>): Promise<ExtrinsicResult<CouncilProposal>> {
    const extrinsic = await this.client.api.tx.council.propose(options.threshold, options.proposal, 1000);
    return this.client.patchExtrinsic<CouncilProposal>(extrinsic, {
      map: res => {
        const result: CouncilProposal = {
          address: res?.[0],
          index: res?.[1],
          hash: res?.[2],
          threshold: res?.[3],
        };
        return result;
      },
    });
  }

  /**
   * Create a close council proposal extrinsic.
   *
   * @param options - The options for closing a proposal.
   * @param options.hash - The proposal hash to be closed.
   * @param options.index - The proposal index to be closed.
   * @returns A promise that resolves to an extrinsic for closing a council proposal.
   */
  @checkConnection
  async close(options: CouncilCloseProposalOptions): Promise<ExtrinsicResult<void>> {
    const now = Math.floor(new Date().getTime() / 1000);
    const extrinsic = await this.client.api.tx.council.close(
      options.hash,
      options.index,
      { refTime: +now, proofSize: 100000 },
      1000,
    );
    return this.client.patchExtrinsic<void>(extrinsic);
  }

  /**
   * Create a vote extrinsic on a council proposal.
   *
   * @param options - The options for voting on a proposal.
   * @param options.hash - The proposal hash to vote on.
   * @param options.index - The proposal index to vote on.
   * @param options.approve - A boolean to vote (with yes or no) on the proposal.
   * @returns A promise that resolves to an extrinsic for voting on a council proposal.
   */
  @checkConnection
  async vote(options: CouncilVoteOptions) {
    const extrinsic = await this.client.api.tx.council.vote(options.hash, options.index, options.approve);
    return this.client.patchExtrinsic(extrinsic);
  }
}

export { Council, QueryCouncil };
