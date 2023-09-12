import moment from "moment";

import { Client, QueryClient } from "./client";
import { checkConnection, hex2a } from "./utils";
interface proposalInterface {
  threshold: number;
  ayes: ayesAndNayesInterface[];
  nayes: ayesAndNayesInterface[];
  vetos: number;
  end: any;
  hash: any;
  action: string;
  description: string;
  link: string;
  ayesProgress: number;
  nayesProgress: number;
}
interface ayesAndNayesInterface {
  farmId: number;
  weight: number;
}
export interface Proposals {
  active: proposalInterface[];
  inactive: proposalInterface[];
}
export interface DaoVoteOptions {
  address: string;
  farmId: string;
  hash: any;
  approve: boolean;
  callback: any;
}
class QueryDao {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(): Promise<Proposals> {
    const hashes: any = await this.client.api.query.dao.proposalList();
    const activeProposals: proposalInterface[] = [];
    const inactiveProposals: proposalInterface[] = [];
    for await (const hash of hashes) {
      const daoProposal: any = await this.getDaoProposal(hash);
      const proposal: any = await this.getProposal(hash);
      const proposalVotes: any = await this.getProposalVotes(hash);

      const nowBlock: any = await this.client.api.query.system.number();
      const timeUntilEnd = (proposalVotes.end - nowBlock.toJSON()) * 6;
      if (proposal) {
        if (proposalVotes.end < nowBlock.toJSON()) {
          inactiveProposals.push({
            threshold: proposalVotes.threshold,
            ayes: proposalVotes.ayes, //[{farmId: number, weight: number}]
            nayes: proposalVotes.nays,
            vetos: proposalVotes.vetos,
            end: moment().add(timeUntilEnd, "second"),
            hash: hash,
            action: hex2a(proposal.args.remark),
            description: hex2a(daoProposal.description),
            link: hex2a(daoProposal.link),
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
            action: hex2a(proposal.args.remark),
            description: hex2a(daoProposal.description),
            link: hex2a(daoProposal.link),
            ayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, true),
            nayesProgress: this.getProgress(proposalVotes.ayes, proposalVotes.nays, false),
          });
        }
      }
    }
    return { active: activeProposals, inactive: inactiveProposals };
  }
  private getVotesWithWeights(votes: ayesAndNayesInterface[]) {
    return votes.reduce((total: number, vote: ayesAndNayesInterface) => {
      return total + vote.weight;
    }, 0);
  }
  private getProgress(ayes: ayesAndNayesInterface[], nayes: ayesAndNayesInterface[], typeAye: boolean) {
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
  private async getDaoProposal(hash: { toJSON: () => any }) {
    const proposal = await this.client.api.query.dao.proposals(hash);
    return proposal.toJSON();
  }
  @checkConnection
  private async getProposal(hash: { toJSON: () => any }) {
    try {
      const proposal = await this.client.api.query.dao.proposalOf(hash);
      const res = proposal.toJSON();
      return res;
    } catch (error) {
      console.warn("Couldn't decode a proposal");
    }
  }
  @checkConnection
  private async getProposalVotes(hash: any) {
    const voting = await this.client.api.query.dao.voting(hash);
    return voting.toJSON();
  }
}
class Dao extends QueryDao {
  constructor(public client: Client) {
    super(client);
    this.client = client;
  }
  @checkConnection
  async vote(options: DaoVoteOptions) {
    const nonce = await this.client.api.rpc.system.accountNextIndex(options.address);
    return this.client.api.tx.dao
      .vote(options.farmId, options.hash, options.approve)
      .signAndSend(this.client.keypair, { nonce }, options.callback);
  }
}
export { Dao, QueryDao };
