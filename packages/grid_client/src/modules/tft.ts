import Decimal from "decimal.js";

import { TFClient } from "..";
import { GridClientConfig } from "../config";
import { expose, validateInput } from "../helpers";
import { CurrencyModel, HourlyTFTModel } from "./models";

class TFTUSDConversionService {
  private client: TFClient;

  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  async price() {
    return await this.client.tftPrice.get();
  }

  @expose
  @validateInput
  async convertUSDtoTFT(options: CurrencyModel): Promise<string> {
    return new Decimal(options.amount / (await this.price())).toFixed(2);
  }

  @expose
  @validateInput
  async convertTFTtoUSD(options: CurrencyModel): Promise<string> {
    return new Decimal(options.amount * (await this.price())).toFixed(2);
  }
  @expose
  @validateInput
  monthlyTFT(options: HourlyTFTModel): string {
    return new Decimal(options.amount * 24 * 30).toFixed(2);
  }

  @expose
  @validateInput
  yearlyTFT(options: HourlyTFTModel): string {
    const months = this.monthlyTFT(options);

    return new Decimal(+months * 12).toFixed(2);
  }
}

export { TFTUSDConversionService as tft };
