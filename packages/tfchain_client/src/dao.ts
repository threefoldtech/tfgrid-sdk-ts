import moment from "moment";

import { Client, QueryClient } from "./client";
import { checkConnection } from "./utils";
interface Proposal {
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
interface ProposalRemark {
  args: { remark: string };
}
interface DaoProposal {
  description: string;
  link: string;
}
interface ProposalVotes {
  ayes: AyesAndNayes[];
  nays: AyesAndNayes[];
  threshold: number;
  vetos: number;
  end: number;
}
export interface Proposals {
  active: Proposal[];
  inactive: Proposal[];
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
  async get(): Promise<Proposals> {
    const hashesJson = (await this.client.api.query.dao.proposalList()).toPrimitive();
    const hashes = JSON.parse(JSON.stringify(hashesJson));
    const activeProposals: Proposal[] = [];
    const inactiveProposals: Proposal[] = [];
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
  private getVotesWithWeights(votes: AyesAndNayes[]) {
    return votes.reduce((total: number, vote: AyesAndNayes) => {
      return total + vote.weight;
    }, 0);
  }
  private getProgress(ayes: AyesAndNayes[], nayes: AyesAndNayes[], typeAye: boolean) {
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
  private async getDaoProposal(hash: string): Promise<DaoProposal> {
    const proposalJson = (await this.client.api.query.dao.proposals(hash)).toPrimitive();
    const proposal: DaoProposal = JSON.parse(JSON.stringify(proposalJson));
    return proposal;
  }

  @checkConnection
  private async getProposal(hash: string): Promise<ProposalRemark | undefined> {
    try {
      const proposalJson = (await this.client.api.query.dao.proposalOf(hash)).toPrimitive();
      const proposalRemark: ProposalRemark = JSON.parse(JSON.stringify(proposalJson));
      return proposalRemark;
    } catch (error) {
      console.warn("Couldn't decode a proposal");
    }
  }
  @checkConnection
  private async getProposalVotes(hash: string): Promise<ProposalVotes> {
    const votesJson = (await this.client.api.query.dao.voting(hash)).toPrimitive();
    const proposalVotes: ProposalVotes = JSON.parse(JSON.stringify(votesJson));
    return proposalVotes;
  }
}
class Dao extends QueryDao {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }
  @checkConnection
  async vote(options: DaoVoteOptions) {
    return this.client.api.tx.dao.vote(options.farmId, options.hash, options.approve);
  }
}
export { Dao, QueryDao };
