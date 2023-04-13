import {
  CosmosGovV1Beta1QueryProposalsResponse,
  Api,
  CosmosGovV1Beta1QueryProposalResponse,
  CosmosGovV1Beta1QueryParamsResponse,
  CosmosGovV1Beta1QueryVotesResponse,
  CosmosGovV1Beta1QueryDepositsResponse,
  CosmosGovV1Beta1QueryTallyResultResponse,
  CosmosStakingV1Beta1QueryValidatorsResponse,
} from "../rest/cosmos";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { snakeToCamelCase } from "./camel";
import { myRegistry } from "./registry";
import { MsgDeposit, MsgSubmitProposal, MsgVote } from "../types/cosmos/gov/v1beta1/tx";
import { MsgDelegate } from "../types/cosmos/staking/v1beta1/tx";
import { TextProposal, VoteOption } from "../types/cosmos/gov/v1beta1/gov";
import { Any } from "../types/google/protobuf/any";
import { BigNumber } from "ethers";
import { Coin } from "../types/cosmos/base/v1beta1/coin";
import { submitWithCheck } from "./txs";
import { SoftwareUpgradeProposal } from "../types/cosmos/upgrade/v1beta1/upgrade";

async function listProposals(
  cosmos_rest: string,
  status?:
    | "PROPOSAL_STATUS_UNSPECIFIED"
    | "PROPOSAL_STATUS_DEPOSIT_PERIOD"
    | "PROPOSAL_STATUS_VOTING_PERIOD"
    | "PROPOSAL_STATUS_PASSED"
    | "PROPOSAL_STATUS_REJECTED"
    | "PROPOSAL_STATUS_FAILED",
  offset?: number,
  limit?: number,
): Promise<CosmosGovV1Beta1QueryProposalsResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosGovV1Beta1Proposals(
    {
      proposalStatus: status,
      "pagination.offset": offset?.toString(),
      "pagination.limit": limit?.toString(),
    },
    { format: "json" },
  );
  snakeToCamelCase(response.data);
  return response.data as CosmosGovV1Beta1QueryProposalsResponse;
}

async function listValidators(
  cosmos_rest: string,
  offset?: number,
  limit?: number,
): Promise<CosmosStakingV1Beta1QueryValidatorsResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosStakingV1Beta1Validators(
    {
      "pagination.offset": offset?.toString(),
      "pagination.limit": limit?.toString(),
    },
    { format: "json" },
  );
  snakeToCamelCase(response.data);
  return response.data as CosmosStakingV1Beta1QueryValidatorsResponse;
}

async function listVotes(
  cosmos_rest: string,
  proposalId: string,
  offset?: number,
  limit?: number,
): Promise<CosmosGovV1Beta1QueryVotesResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosGovV1Beta1Votes(
    proposalId,
    {
      "pagination.limit": limit?.toString(),
      "pagination.offset": offset?.toString(),
    },
    { format: "json" },
  );
  snakeToCamelCase(response.data);
  return response.data as CosmosGovV1Beta1QueryVotesResponse;
}

async function listDeposites(
  cosmos_rest: string,
  proposalId: string,
  offset?: number,
  limit?: number,
): Promise<CosmosGovV1Beta1QueryDepositsResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosGovV1Beta1Deposits(
    proposalId,
    {
      "pagination.limit": limit?.toString(),
      "pagination.offset": offset?.toString(),
    },
    { format: "json" },
  );
  snakeToCamelCase(response.data);
  return response.data as CosmosGovV1Beta1QueryDepositsResponse;
}

async function getProposal(cosmos_rest: string, proposalId: string): Promise<CosmosGovV1Beta1QueryProposalResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosGovV1Beta1Proposal(proposalId, { format: "json" });
  snakeToCamelCase(response.data);
  if (response.data.proposal?.status == "PROPOSAL_STATUS_VOTING_PERIOD") {
    const currentTally = await tally(cosmos_rest, proposalId);
    response.data.proposal.finalTallyResult = await currentTally.tally;
  }
  return response.data as CosmosGovV1Beta1QueryProposalResponse;
}

async function tally(cosmos_rest: string, proposalId: string): Promise<CosmosGovV1Beta1QueryTallyResultResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.cosmos.cosmosGovV1Beta1TallyResult(proposalId, { format: "json" });
  snakeToCamelCase(response.data);
  return response.data as CosmosGovV1Beta1QueryTallyResultResponse;
}

async function parameters(cosmos_rest: string): Promise<CosmosGovV1Beta1QueryParamsResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  // requesting all params is not supported over rest
  const params = await queryClient.cosmos.cosmosGovV1Beta1Params("deposit", {
    format: "json",
  });
  const tallying_params = await queryClient.cosmos.cosmosGovV1Beta1Params("tallying", { format: "json" });
  const voting_params = await queryClient.cosmos.cosmosGovV1Beta1Params("voting", { format: "json" });
  snakeToCamelCase(params.data);
  snakeToCamelCase(tallying_params.data);
  snakeToCamelCase(voting_params.data);
  params.data.tallyParams = tallying_params.data.tallyParams;
  params.data.votingParams = voting_params.data.votingParams;
  return params.data as CosmosGovV1Beta1QueryParamsResponse;
}

async function submitProposal(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  content: TextProposal,
  initialDeposit: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
  const sender = (await offlineSigner.getAccounts())[0];
  let client: SigningStargateClient;
  return SigningStargateClient.connectWithSigner(
    tendermint_rpc, // Replace with your own RPC endpoint
    offlineSigner,
    { registry: myRegistry, gasPrice: GasPrice.fromString(gas_price) },
  )
    .then(_client => (client = _client))
    .then(() => window.keplr.getKey(chain_id))
    .then(account => {
      const message = {
        typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal", // Same as above
        value: MsgSubmitProposal.fromPartial({
          content: Any.fromPartial({
            typeUrl: "/cosmos.gov.v1beta1.TextProposal",
            value: TextProposal.encode(content).finish(),
          }),
          initialDeposit: [
            Coin.fromPartial({
              amount: initialDeposit.toString(),
              denom: denom,
            }),
          ],
          proposer: sender.address,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", initialDeposit);
    });
}

async function submitSoftwareUpgradeProposal(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  content: SoftwareUpgradeProposal,
  initialDeposit: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  // TODO: should this be done globally one time?
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
  const sender = (await offlineSigner.getAccounts())[0];
  let client: SigningStargateClient;
  return SigningStargateClient.connectWithSigner(
    tendermint_rpc, // Replace with your own RPC endpoint
    offlineSigner,
    { registry: myRegistry, gasPrice: GasPrice.fromString(gas_price) },
  )
    .then(_client => (client = _client))
    .then(() => window.keplr.getKey(chain_id))
    .then(account => {
      const message = {
        typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal", // Same as above
        value: MsgSubmitProposal.fromPartial({
          content: Any.fromPartial({
            typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
            value: SoftwareUpgradeProposal.encode(content).finish(),
          }),
          initialDeposit: [
            Coin.fromPartial({
              amount: initialDeposit.toString(),
              denom: denom,
            }),
          ],
          proposer: sender.address,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", initialDeposit);
    });

  // TODO: how to check transaction errors
}

async function deposit(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  proposalId: string,
  deposit: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
  const sender = (await offlineSigner.getAccounts())[0];
  let client: any;
  return SigningStargateClient.connectWithSigner(
    tendermint_rpc, // Replace with your own RPC endpoint
    offlineSigner,
    { registry: myRegistry, gasPrice: GasPrice.fromString(gas_price) },
  )
    .then(_client => (client = _client))
    .then(() => window.keplr.getKey(chain_id))
    .then(account => {
      const message = {
        typeUrl: "/cosmos.gov.v1beta1.MsgDeposit", // Same as above
        value: MsgDeposit.fromPartial({
          amount: [
            Coin.fromPartial({
              amount: deposit.toString(),
              denom: denom,
            }),
          ],
          depositor: sender.address,
          proposalId: proposalId,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", deposit);
    });
}

async function delegate(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  validatorAddress: string,
  amount: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
  const sender = (await offlineSigner.getAccounts())[0];
  let client: any;
  return SigningStargateClient.connectWithSigner(
    tendermint_rpc, // Replace with your own RPC endpoint
    offlineSigner,
    { registry: myRegistry, gasPrice: GasPrice.fromString(gas_price) },
  )
    .then(_client => (client = _client))
    .then(() => window.keplr.getKey(chain_id))
    .then(account => {
      const message = {
        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate", // Same as above
        value: MsgDelegate.fromPartial({
          amount: Coin.fromPartial({
            amount: amount.toString(),
            denom: denom,
          }),
          delegatorAddress: sender.address,
          validatorAddress: validatorAddress,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", amount);
    });
}

async function submitVote(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  proposalId: string,
  vote: VoteOption,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
  const sender = (await offlineSigner.getAccounts())[0];
  let client: any;
  return SigningStargateClient.connectWithSigner(
    tendermint_rpc, // Replace with your own RPC endpoint
    offlineSigner,
    { registry: myRegistry, gasPrice: GasPrice.fromString(gas_price) },
  )
    .then(_client => (client = _client))
    .then(() => window.keplr.getKey(chain_id))
    .then(account => {
      const message = {
        typeUrl: "/cosmos.gov.v1beta1.MsgVote", // Same as above
        value: MsgVote.fromPartial({
          voter: sender.address,
          proposalId: proposalId,
          option: vote,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", BigNumber.from("0"));
    });
}

export {
  deposit,
  delegate,
  listProposals,
  listValidators,
  listVotes,
  listDeposites,
  getProposal,
  tally,
  parameters,
  submitProposal,
  submitVote,
  submitSoftwareUpgradeProposal,
};
