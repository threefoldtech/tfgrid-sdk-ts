import moment from "moment";

import { Client, QueryClient } from "./client";
import { ExtrinsicResult } from "./types";
import { checkConnection } from "./utils";
export interface DaoProposalDetails {
  threshold: number;
  ayes: AyesAndNayes[];
  nayes: AyesAndNayes[];
  vetos: number;
  end: moment.Moment;
  hash: string;
  action: string;
  description: string;
  link: string;
  ayesProgress: number;
  nayesProgress: number;
}
interface AyesAndNayes {
  farmId: number;
  weight: number;
}
interface DaoProposalRemark {
  args: { remark: string };
}
interface DaoProposalInfo {
  description: string;
  link: string;
}
interface DaoProposalVotes {
  ayes: AyesAndNayes[];
  nays: AyesAndNayes[];
  threshold: number;
  vetos: number;
  end: number;
}
export interface DaoProposals {
  active: DaoProposalDetails[];
  inactive: DaoProposalDetails[];
}
export interface DaoVoteOptions {
  address: string;
  farmId: number;
  hash: string;
  approve: boolean;
}

class QueryDao {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(): Promise<DaoProposals> {
    const hashesJson = await this.client.api.query.dao.proposalList();
    const hashes = hashesJson.toPrimitive() as string[];
    const activeProposals: DaoProposalDetails[] = [];
    const inactiveProposals: DaoProposalDetails[] = [];
    for await (const hash of hashes) {
      const daoProposal = await this.getDaoProposal(hash);
      const proposal = await this.getProposal(hash);
      const proposalVotes = await this.getProposalVotes(hash);

      const nowBlock: number = +(await this.client.api.query.system.number());
      const timeUntilEnd = (proposalVotes.end - nowBlock) * 6;
      if (proposal && daoProposal) {
        if (proposalVotes.end < nowBlock) {
          inactiveProposals.push({
            threshold: proposalVotes.threshold,
            ayes: proposalVotes.ayes, //[{farmId: number, weight: number}]
            nayes: proposalVotes.nays,
            vetos: proposalVotes.vetos,
            end: moment().add(timeUntilEnd, "second"),
            hash: hash,
            action: proposal.args.remark,
            description: daoProposal.description,
            link: daoProposal.link,
            ayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, true),
            nayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, false),
          });
        } else {
          activeProposals.push({
            threshold: proposalVotes.threshold,
            ayes: proposalVotes.ayes, //[{farmId: number, weight: number}]
            nayes: proposalVotes.nays,
            vetos: proposalVotes.vetos,
            end: moment().add(timeUntilEnd, "second"),
            hash: hash,
            action: proposal.args.remark,
            description: daoProposal.description,
            link: daoProposal.link,
            ayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, true),
            nayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, false),
          });
        }
      }
    }
    return { active: activeProposals, inactive: inactiveProposals };
  }
  private getVotesWithWeights(votes: AyesAndNayes[]): number {
    return votes.reduce((total: number, vote: AyesAndNayes) => {
      return total + vote.weight;
    }, 0);
  }
  private getProgress(ayes: AyesAndNayes[], nayes: AyesAndNayes[], typeAye: boolean): number {
    const totalAyeWeight = ayes ? this.getVotesWithWeights(ayes) : 0;
    const totalNayeWeight = nayes ? this.getVotesWithWeights(nayes) : 0;
    const total = totalAyeWeight + totalNayeWeight;
    if (total > 0) {
      if (typeAye) {
        return (totalAyeWeight / total) * 100;
      }
      return (totalNayeWeight / total) * 100;
    }
    return 0;
  }
  @checkConnection
  private async getDaoProposal(hash: string): Promise<DaoProposalInfo> {
    const proposalJson = await this.client.api.query.dao.proposals(hash);
    const proposal: DaoProposalInfo = proposalJson.toPrimitive() as unknown as DaoProposalInfo;
    return proposal;
  }

  @checkConnection
  private async getProposal(hash: string): Promise<DaoProposalRemark | undefined> {
    try {
      const proposalJson = await this.client.api.query.dao.proposalOf(hash);
      const proposalRemark: DaoProposalRemark = proposalJson.toPrimitive() as unknown as DaoProposalRemark;
      return proposalRemark;
    } catch (error) {
      console.warn("Couldn't decode a proposal");
    }
  }
  @checkConnection
  private async getProposalVotes(hash: string): Promise<DaoProposalVotes> {
    const votesJson = await this.client.api.query.dao.voting(hash);
    const proposalVotes: DaoProposalVotes = votesJson.toPrimitive() as unknown as DaoProposalVotes;
    return proposalVotes;
  }
}

export interface DaoProposeOptions<T> {
  proposal: ExtrinsicResult<T>;
  threshold: number;
  description: string;
  link: string;
  duration: number | null;
}

export interface DaoProposal {
  address: string;
  index: number;
  hash: string;
  threshold: number;
}

class Dao extends QueryDao {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }

  @checkConnection
  async propose<T>(options: DaoProposeOptions<T>) {
    const extrinsic = await this.client.api.tx.dao.propose(
      options.threshold,
      options.proposal,
      options.description,
      options.link,
      options.duration,
    );
    return this.client.patchExtrinsic(extrinsic, {
      map: res => {
        const result: DaoProposal = {
          address: res?.[0],
          index: res?.[1],
          hash: res?.[2],
          threshold: res?.[3],
        };
        return result;
      },
    });
  }

  @checkConnection
  async vote(options: DaoVoteOptions) {
    const extrinsic = this.client.api.tx.dao.vote(options.farmId, options.hash, options.approve);
    return this.client.patchExtrinsic(extrinsic);
  }
}
export { Dao, QueryDao };
