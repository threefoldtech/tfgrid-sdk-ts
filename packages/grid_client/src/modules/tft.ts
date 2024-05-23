import Decimal from "decimal.js";

import { expose, validateInput } from "../helpers";
import { CurrencyModel } from "./models";

class TFTUSDConversionService {
  // TFT rate: 1 tft = x USD
  constructor(public rate: number, private decimals = 2) {}

  @expose
  @validateInput
  normalizeCurrency(options: CurrencyModel): string {
    return new Decimal(options.amount).toFixed(this.decimals);
  }

  @expose
  @validateInput
  convertUSDtoTFT(options: CurrencyModel): string {
    const amount = options.amount / this.rate;
    return this.normalizeCurrency({ amount });
  }

  @expose
  @validateInput
  convertTFTtoUSD(options: CurrencyModel): string {
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
