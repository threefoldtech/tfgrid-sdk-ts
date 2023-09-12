import { SwapToStellarOptions, TFTBridge } from "@threefold/tfchain_client";
import Decimal from "decimal.js";

class Bridge extends TFTBridge {
  async withdraw(options: SwapToStellarOptions) {
    const decimalAmount = new Decimal(options.amount);
    const decimalAmountInTFT = decimalAmount.mul(10 ** 7).toNumber();
    return await super.withdraw({ amount: decimalAmountInTFT, target: options.target });
  }

  async getWithdrawFee(): Promise<number> {
    const fee = await super.getWithdrawFee();
    const decimalAmount = new Decimal(fee.toString());
    const convertedFee = decimalAmount.div(10 ** 7).toNumber();
    return convertedFee;
  }

  async getDepositFee(): Promise<number> {
    const fee = await super.getDepositFee();
    const decimalAmount = new Decimal(fee.toString());
    const convertedFee = decimalAmount.div(10 ** 7).toNumber();
    return convertedFee;
  }
}

export { Bridge };
