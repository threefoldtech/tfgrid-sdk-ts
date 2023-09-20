import moment from "moment";

import { Client, QueryClient } from "./client";
import { checkConnection, hex2a } from "./utils";
interface proposal {
  threshold: number;
  ayes: ayesAndNayes[];
  nayes: ayesAndNayes[];
  vetos: number;
  end: any;
  hash: string;
  action: string;
  description: string;
  link: string;
  ayesProgress: number;
  nayesProgress: number;
}
interface ayesAndNayes {
  farmId: number;
  weight: number;
}
export interface Proposals {
  active: proposal[];
  inactive: proposal[];
}
export interface DaoVoteOptions {
  address: string;
  farmId: string;
  hash: string;
  approve: boolean;
}
// interface daoProposal {
//   index: number;
//   description: string;
//   link: string;
// }
class daoProposal {
  index: number;
  description: string;
  link: string;
  constructor(data: Partial<daoProposal>) {
    Object.assign(this, data);
  }
  // public static fromJSON = (json: string): daoProposal => {
  //   const jsonObject = JSON.parse(json);
  //   return new daoProposal(jsonObject);
  // };
}
class QueryDao {
  constructor(public client: QueryClient) {
    this.client = client;
  }

  @checkConnection
  async get(): Promise<Proposals> {
    const hashes: any = await this.client.api.query.dao.proposalList();
    const activeProposals: proposal[] = [];
    const inactiveProposals: proposal[] = [];
    for await (const hash of hashes) {
      const daoProposal = await this.getDaoProposal(hash);
      const proposal: any = await this.getProposal(hash);
      const proposalVotes: any = await this.getProposalVotes(hash);
      console.log(daoProposal);
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
  private getVotesWithWeights(votes: ayesAndNayes[]) {
    return votes.reduce((total: number, vote: ayesAndNayes) => {
      return total + vote.weight;
    }, 0);
  }
  private getProgress(ayes: ayesAndNayes[], nayes: ayesAndNayes[], typeAye: boolean) {
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
    const proposal = (await this.client.api.query.dao.proposals(hash)).toPrimitive();

    return Object.assign(daoProposal, proposal.toString);
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
  private async getProposalVotes(hash: string) {
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
      .signAndSend(this.client.keypair, { nonce });
  }
}
export { Dao, QueryDao };
