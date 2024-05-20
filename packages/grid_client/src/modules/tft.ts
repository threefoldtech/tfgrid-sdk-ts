import Decimal from "decimal.js";

import { TFClient } from "..";
import { GridClientConfig } from "../config";
import { expose, validateInput } from "../helpers";
import { CurrencyModel, HourlyTFTModel } from "./models";

class TFTUSDConversionService {
  private client: TFClient;
  private decimals = 2;

  constructor(public config: GridClientConfig) {
    this.client = config.tfclient;
  }

  async price() {
    return await this.client.tftPrice.get();
  }

  @expose
  @validateInput
  async convertUSDtoTFT(options: CurrencyModel): Promise<string> {
    return new Decimal(options.amount / (await this.price())).toFixed(this.decimals);
  }

  @expose
  @validateInput
  async convertTFTtoUSD(options: CurrencyModel): Promise<string> {
    return new Decimal(options.amount * (await this.price())).toFixed(this.decimals);
  }
  @expose
  @validateInput
  monthlyTFT(options: HourlyTFTModel): string {
    return new Decimal(options.amount * 24 * 30).toFixed(this.decimals);
  }

  @expose
  @validateInput
  yearlyTFT(options: HourlyTFTModel): string {
    const months = this.monthlyTFT(options);

    return new Decimal(+months * 12).toFixed(this.decimals);
  }
}

export { TFTUSDConversionService as tft };
