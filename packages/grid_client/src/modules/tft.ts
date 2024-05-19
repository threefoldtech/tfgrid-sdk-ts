import { QueryClient } from "@threefold/tfchain_client";
import Decimal from "decimal.js";

import { expose, validateInput } from "../helpers";
import { calculator as Calculator } from "./calculator";
import { TFTModel, USDModel } from "./models";

enum substrateURL {
  DEV = "wss://tfchain.dev.grid.tf/ws",
  QA = "wss://tfchain.qa.grid.tf/ws",
  TEST = "wss://tfchain.test.grid.tf/ws",
  MAIN = "wss://tfchain.grid.tf/ws",
}

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

  @expose
  @validateInput
  async fromUSD(options: USDModel) {
    return new Decimal(options.usd / (await this.price())).toFixed(2);
  }

  @expose
  @validateInput
  async toUSD(options: TFTModel) {
    return new Decimal(options.tft * (await this.price())).toFixed(2);
  }
  @expose
  @validateInput
  toMonth(options: TFTModel) {
    return new Decimal(options.tft * 24 * 30).toFixed(2);
  }

  @expose
  @validateInput
  toYear(options: TFTModel) {
    const months = +this.toMonth(options);
    return new Decimal(months * 12).toFixed(2);
  }
}

export { TFT, substrateURL };
