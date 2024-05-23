import Decimal from "decimal.js";

import { GridClientConfig, TFClient } from "..";
import { expose, validateInput } from "../helpers";
import { CurrencyModel } from "./models";

class TFTUSDConversionService {
  private tfclient: TFClient;
  private rate: number;

  constructor(public config: GridClientConfig, public decimals = 2) {
    this.decimals = decimals;
    this.tfclient = config.tfclient;
    this.tfclient.tftPrice.get().then(res => {
      this.rate = res;
    });
  }

  @expose
  @validateInput
  normalizeCurrency(options: CurrencyModel) {
    return new Decimal(options.amount).toFixed(this.decimals);
  }

  @expose
  @validateInput
  convertUSDtoTFT(options: CurrencyModel) {
    const amount = options.amount / this.rate;
    return this.normalizeCurrency({ amount });
  }

  @expose
  @validateInput
  convertTFTtoUSD(options: CurrencyModel) {
    const amount = options.amount * this.rate;
    return this.normalizeCurrency({ amount });
  }

  @expose
  @validateInput
  dailyTFT(options: CurrencyModel): string {
    const hours = options.amount * 24;
    return this.normalizeCurrency({ amount: hours });
  }

  @expose
  @validateInput
  monthlyTFT(options: CurrencyModel): string {
    const months = +this.dailyTFT(options) * 30;
    return this.normalizeCurrency({ amount: months });
  }

  @expose
  @validateInput
  yearlyTFT(options: CurrencyModel): string {
    const years = +this.monthlyTFT(options) * 12;
    return this.normalizeCurrency({ amount: years });
  }

  @expose
  @validateInput
  dailyUSD(options: CurrencyModel): string {
    const hours = options.amount * 24;
    return this.normalizeCurrency({ amount: hours });
  }

  @expose
  @validateInput
  monthlyUSD(options: CurrencyModel): string {
    const months = +this.dailyUSD(options) * 30;
    return this.normalizeCurrency({ amount: months });
  }

  @expose
  @validateInput
  yearlyUSD(options: CurrencyModel): string {
    const years = +this.monthlyUSD(options) * 12;
    return this.normalizeCurrency({ amount: years });
  }
}

export { TFTUSDConversionService as currency };
