import { Api, CosmosBankV1Beta1QueryBalanceResponse } from "../rest/cosmos";
import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse, GasPrice, SigningStargateClient, StdFee, calculateFee } from "@cosmjs/stargate";
import { BigNumber } from "ethers";
import { snakeToCamelCase } from "./camel";

async function accountBalance(
  cosmos_rest: string,
  address: string,
  denom: string,
): Promise<CosmosBankV1Beta1QueryBalanceResponse> {
  const queryClient = new Api({ baseUrl: cosmos_rest });
  let response: any;
  try {
    response = await queryClient.cosmos.cosmosBankV1Beta1Balance(address, { denom: denom }, { format: "json" });
  } catch (err: any) {
    throw err.error;
  }
  snakeToCamelCase(response.data);
  return response.data as CosmosBankV1Beta1QueryBalanceResponse;
}

async function simulate(
  client: SigningStargateClient,
  signerAddress: string,
  messages: readonly EncodeObject[],
  memo?: string,
) {
  const gasPrice: GasPrice = (client as any).gasPrice;
  if (gasPrice === undefined) throw new Error("Gas price must be set in the client options when auto gas is used.");
  const gasEstimation = await client.simulate(signerAddress, messages, memo);
  return calculateFee(Math.round(gasEstimation * 1.3), gasPrice);
}

async function submitWithCheck(
  client: SigningStargateClient,
  cosmos_rest: string,
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee | "auto" | number,
  opPayment: BigNumber,
  memo?: string,
): Promise<DeliverTxResponse> {
  let usedFee: StdFee;
  if (fee == "auto" || typeof fee === "number") {
    const gasPrice: GasPrice = (client as any).gasPrice;
    if (gasPrice === undefined) throw new Error("Gas price must be set in the client options when auto gas is used.");
    usedFee = await simulate(client, signerAddress, messages, memo);
  } else {
    usedFee = fee;
  }
  // We assume the fee denom is used for everything else (i.e TFT)
  const balance = await accountBalance(cosmos_rest, signerAddress, usedFee.amount[0].denom);
  const balanceNumber = BigNumber.from(balance.balance?.amount);
  const paid = opPayment.add(usedFee.amount[0].amount);
  if (balanceNumber.lt(paid)) {
    throw new Error(
      "Transaction with fees requires " + paid.toString() + ", account balance is " + balanceNumber.toString(),
    );
  }
  return client.signAndBroadcast(signerAddress, messages, usedFee).then(res => {
    if (res.code != 0) {
      throw new Error("Failed with code " + res.code + ": " + res.rawLog);
    }
    return res;
  });
}

export { submitWithCheck, simulate };
