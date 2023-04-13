import { hex2a } from "./util";
import moment from "moment";
import { web3FromAddress } from "@polkadot/extension-dapp";
export interface ayesAndNayesInterface {
  farmId: number;
  weight: number;
}
export interface proposalInterface {
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
export async function vote(
  address: string,
  api: {
    tx: {
      dao: {
        vote: (
          arg0: any,
          arg1: any,
          arg2: any,
        ) => { (): any; new (): any; signAndSend: { (arg0: any, arg1: { signer: any }, arg2: any): any; new (): any } };
      };
    };
  },
  farmId: string,
  hash: any,
  approve: boolean,
  callback: any,
) {
  try {
    const injector = await web3FromAddress(address);
    return api.tx.dao.vote(farmId, hash, approve).signAndSend(address, { signer: injector.signer }, callback);
  } catch (error) {
    console.log(`err while trying to get injector ${error}`);
  }
}
export async function getProposals(api: any) {
  const activeProposals: proposalInterface[] = [];
  const inactiveProposals: proposalInterface[] = [];
  const hashes = await api.query.dao.proposalList();

  for await (const hash of hashes) {
    const daoProposal = await getDaoProposal(api, hash);
    const proposal = await getProposal(api, hash);
    const proposalVotes = await getProposalVotes(api, hash);

    const nowBlock = await api.query.system.number();
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
          ayesProgress: getProgress(proposalVotes.ayes, proposalVotes.nays, true),
          nayesProgress: getProgress(proposalVotes.ayes, proposalVotes.nays, false),
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
          ayesProgress: getProgress(proposalVotes.ayes, proposalVotes.nays, true),
          nayesProgress: getProgress(proposalVotes.ayes, proposalVotes.nays, false),
        });
      }
    }
  }
  return { active: activeProposals, inactive: inactiveProposals };
}
export function getVotesWithWeights(votes: ayesAndNayesInterface[]) {
  return votes.reduce((total: number, vote: ayesAndNayesInterface) => {
    return total + vote.weight;
  }, 0);
}
export function getProgress(ayes: ayesAndNayesInterface[], nayes: ayesAndNayesInterface[], typeAye: boolean) {
  const totalAyeWeight = ayes ? getVotesWithWeights(ayes) : 0;
  const totalNayeWeight = nayes ? getVotesWithWeights(nayes) : 0;
  const total = totalAyeWeight + totalNayeWeight;
  if (total > 0) {
    if (typeAye) {
      return (totalAyeWeight / total) * 100;
    }
    return (totalNayeWeight / total) * 100;
  }
  return 0;
}
export async function getDaoProposal(api: { query: any }, hash: { toJSON: () => any }) {
  const proposal = await api.query.dao.proposals(hash);
  return proposal.toJSON();
}
export async function getProposal(api: { query: any }, hash: { toJSON: () => any }) {
  try {
    const proposal = await api.query.dao.proposalOf(hash);
    const res = proposal.toJSON();
    return res;
  } catch (error) {
    console.warn("Couldn't decode a proposal");
  }
}
export async function getProposalVotes(api: any, hash: any) {
  const voting = await api.query.dao.voting(hash);
  return voting.toJSON();
}
