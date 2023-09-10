import { SwapToStellarOptions, TFTBridge } from "@threefold/tfchain_client";
import Decimal from "decimal.js";

class Bridge extends TFTBridge {
  async withdraw(options: SwapToStellarOptions) {
    const decimalAmount = new Decimal(options.amount);
    const decimalAmountInTFT = decimalAmount.mul(10 ** 7).toNumber();
    return await super.withdraw({ amount: decimalAmountInTFT, target: options.target });
  }

  async GetWithdrawFee(): Promise<string> {
    const fee = await super.GetWithdrawFee();
    const decimalAmount = new Decimal(fee.toString());
    const convertedFee = decimalAmount.div(10 ** 7).toNumber();
    return convertedFee.toString();
  }

  async GetDepositFee(): Promise<string> {
    const fee = await super.GetDepositFee();
    const decimalAmount = new Decimal(fee.toString());
    const convertedFee = decimalAmount.div(10 ** 7).toNumber();
    return convertedFee.toString();
  }
}

export { Bridge };
