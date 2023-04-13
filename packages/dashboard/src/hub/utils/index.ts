import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { MsgCancelSendToEth, MsgSendToEth } from "../types/gravity/v1/msgs"; // Replace with your own Msg import
import { BigNumber, ethers } from "ethers";
import bepapi from "../json/bepabi.json";
import gravityabi from "../json/gravityabi.json";
import { Api, GravityV1QueryPendingSendToEthResponse } from "../rest/cosmos";
import Long from "long";
import { snakeToCamelCase } from "./camel";
import { myRegistry } from "./registry";
import { submitWithCheck, simulate } from "./txs";
import { waitBscTransaction } from "./eth";
const UINT256_MAX_INT = ethers.BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
);

export async function sendToCosmos(
  token_contract_address: string,
  gravity_contract_address: string,
  destination: string,
  amount: BigNumber,
) {
  if (!window.ethereum) {
    throw new Error("metamask is not installed");
  }
  if (!window.ethereum.isMetaMask) {
    throw new Error("using something else than metamask. we only support metamask.");
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(0);
  const bepContract = new ethers.Contract(token_contract_address, bepapi as any, signer);
  const gravityContract = new ethers.Contract(gravity_contract_address, gravityabi as any, signer);
  const senderAddress = (await window.ethereum.request({ method: "eth_requestAccounts" }))[0];
  const allowance = ethers.BigNumber.from(await bepContract.allowance(senderAddress, gravity_contract_address));
  if (allowance.lt(amount)) {
    // should we get only the allowance we need for this operation or require the max
    //        gbt client does the max thing but it seems fishy
    //        metamask however provides the user with the given amount
    //        and the ability to change it
    //        performing allowance everytime will cost extra fees
    //
    const tx = await bepContract.approve(gravity_contract_address, UINT256_MAX_INT);
    try {
      await waitBscTransaction(provider, tx.hash);
    } catch (_) {
      throw new Error(
        "Allowance tx with hash " + tx.hash + " took more than 15 seconds. Try sending again after it succeeds.",
      );
    }
  }

  return gravityContract.sendToCosmos(token_contract_address, destination, amount);
}

export function sendToEth(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  destination: string,
  amount: BigNumber,
  bridge_fees: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
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
        typeUrl: "/gravity.v1.MsgSendToEth", // Same as above
        value: MsgSendToEth.fromPartial({
          sender: account.bech32Address,
          amount: {
            amount: amount.toString(),
            denom: denom,
          },
          bridgeFee: {
            amount: bridge_fees.toString(),
            denom: denom,
          },
          ethDest: destination,
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", amount.add(bridge_fees));
    });
}

export function sendToEthFees(
  tendermint_rpc: string,
  gas_price: string,
  chain_id: string,
  destination: string,
  amount: BigNumber,
  bridge_fees: BigNumber,
  denom: string,
) {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const offlineSigner = window.keplr.getOfflineSigner(chain_id);
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
        typeUrl: "/gravity.v1.MsgSendToEth", // Same as above
        value: MsgSendToEth.fromPartial({
          sender: account.bech32Address,
          amount: {
            amount: amount.toString(),
            denom: denom,
          },
          bridgeFee: {
            amount: bridge_fees.toString(),
            denom: denom,
          },
          ethDest: destination,
        }),
      };
      return simulate(client, account.bech32Address, [message]);
    });
}

export async function cancelSendToEth(
  tendermint_rpc: string,
  cosmos_rest: string,
  gas_price: string,
  chain_id: string,
  transactionId: string,
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
        typeUrl: "/gravity.v1.MsgCancelSendToEth", // Same as above
        value: MsgCancelSendToEth.fromPartial({
          sender: sender.address,
          transactionId: Long.fromString(transactionId),
        }),
      };
      return submitWithCheck(client, cosmos_rest, account.bech32Address, [message], "auto", BigNumber.from("0"));
    });
}

export async function pendingSendToEth(
  cosmos_rest: string,
  chain_id: string,
): Promise<GravityV1QueryPendingSendToEthResponse> {
  if (!window.keplr) {
    throw new Error("keplr is not installed");
  }
  const signer = window.keplr.getOfflineSigner(chain_id);
  const sender = (await signer.getAccounts())[0].address;
  const queryClient = new Api({ baseUrl: cosmos_rest });
  const response = await queryClient.gravity.gravityV1GetPendingSendToEth(
    { senderAddress: sender },
    { format: "json" },
  );
  snakeToCamelCase(response.data);
  return response.data as GravityV1QueryPendingSendToEthResponse;
}
