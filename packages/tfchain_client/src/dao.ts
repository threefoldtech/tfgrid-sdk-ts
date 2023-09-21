import moment from "moment";

import { Client, QueryClient } from "./client";
import { checkConnection, hex2a } from "./utils";
interface proposal {
  threshold: number;
  ayes: ayesAndNayes[];
  nayes: ayesAndNayes[];
  vetos: number;
  end: moment.Moment;
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
class proposalPart {
  args: { remark: string };
  constructor(data: Partial<proposalPart>) {
    Object.assign(this, data);
  }

  public static fromJSON = (json: string): proposalPart => {
    const jsonObject = JSON.parse(json);
    return new proposalPart(jsonObject);
  };
}

class daoProposal {
  index: number;
  description: string;
  link: string;

  constructor(data: Partial<daoProposal>) {
    Object.assign(this, data);
  }

  public static fromJSON = (json: string): daoProposal => {
    const jsonObject = JSON.parse(json);
    return new daoProposal(jsonObject);
  };
}
class proposalVotes {
  end: number;
  ayes: ayesAndNayes[];
  nays: ayesAndNayes[];
  vetos: number;
  threshold: number;

  constructor(data: Partial<proposalVotes>) {
    Object.assign(this, data);
  }

  public static fromJSON = (json: string): proposalVotes => {
    const jsonObject = JSON.parse(json);
    return new proposalVotes(jsonObject);
  };
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
      const proposal = await this.getProposal(hash);
      const proposalVotes = await this.getProposalVotes(hash);

      const nowBlock: any = await this.client.api.query.system.number();
      const timeUntilEnd = (proposalVotes.end - nowBlock.toJSON()) * 6;
      if (proposal && daoProposal) {
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
    const proposalJson = (await this.client.api.query.dao.proposals(hash)).toPrimitive();

    const proposal = daoProposal.fromJSON(JSON.stringify(proposalJson));

    return proposal;
  }
  @checkConnection
  private async getProposal(hash: { toJSON: () => any }) {
    try {
      const proposalJson = (await this.client.api.query.dao.proposalOf(hash)).toPrimitive();

      return proposalPart.fromJSON(JSON.stringify(proposalJson));
    } catch (error) {
      console.warn("Couldn't decode a proposal");
    }
  }
  @checkConnection
  private async getProposalVotes(hash: string) {
    const voting = (await this.client.api.query.dao.voting(hash)).toPrimitive();
    return proposalVotes.fromJSON(JSON.stringify(voting));
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
