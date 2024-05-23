import Decimal from "decimal.js";

import { GridClientConfig, TFClient } from "..";
import { expose, validateInput } from "../helpers";
import { CurrencyModel } from "./models";

class TFTUSDConversionService {
  private decimals = 2;
  private tfclient: TFClient;
  TFTPrice: number;

  constructor(public config: GridClientConfig) {
    this.tfclient = config.tfclient;
    this.tfclient.tftPrice.get().then(res => {
      this.TFTPrice = res;
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
    const amount = options.amount / this.TFTPrice;
    return this.normalizeCurrency({ amount });
  }

  @expose
  @validateInput
  convertTFTtoUSD(options: CurrencyModel) {
    const amount = options.amount * this.TFTPrice;
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
    const dailyTFTs = +this.dailyTFT(options);
    return this.convertTFTtoUSD({ amount: dailyTFTs });
  }

  @expose
  @validateInput
  monthlyUSD(options: CurrencyModel): string {
    const monthlyTFTs = +this.dailyTFT(options) * 30;
    return this.convertTFTtoUSD({ amount: monthlyTFTs });
  }

  @expose
  @validateInput
  yearlyUSD(options: CurrencyModel): string {
    const yearlyTFT = +this.monthlyTFT(options) * 12;

    return this.convertTFTtoUSD({ amount: yearlyTFT });
  }
}

export { TFTUSDConversionService as currency };
