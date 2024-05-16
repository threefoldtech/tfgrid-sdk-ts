import { QueryClient } from "@threefold/tfchain_client";
import Decimal from "decimal.js";

import { calculator as Calculator } from "./calculator";

class TFT {
  public SUBSTRATE_URL: string;
  private calculator: Calculator;

  constructor(SUBSTRATE_URL: string) {
    this.SUBSTRATE_URL = SUBSTRATE_URL;
    this.calculator = new Calculator(new QueryClient(this.SUBSTRATE_URL));
  }

  async price() {
    return await this.calculator.tftPrice();
  }

  async fromUSD(usd: number) {
    return new Decimal(usd / (await this.price())).toFixed(2);
  }

  async toUSD(tft: number) {
    return new Decimal(tft * (await this.price())).toFixed(2);
  }

  toMonth(price: number) {
    return new Decimal(price * 24 * 30).toFixed(2);
  }

  toYear(price: number) {
    return new Decimal(+this.toMonth(price) * 12).toFixed(2);
  }
}

export { TFT };
