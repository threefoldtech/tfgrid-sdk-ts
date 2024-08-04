import Decimal from "decimal.js";

import { expose, validateInput } from "../helpers";
import { CurrencyModel } from "./models";

class TFTUSDConversionService {
  // TFT rate: 1 TFT = x USD
  /**
   * Class representing a service for converting between TFT (ThreeFold Token) and USD (United States Dollar).
   * The service provides methods for normalizing currency amounts, converting between TFT and USD, and calculating daily, monthly, and yearly amounts in both currencies.
   */
  constructor(private _rate: number, private decimals = 2) {}

  get rate() {
    return this._rate;
  }

  /**
   * Normalize the currency amount to a string with a fixed number of decimals.
   *
   * @param options - The currency model containing the amount to normalize.
   * @returns A string representation of the normalized currency amount.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  normalizeCurrency(options: CurrencyModel): string {
    return new Decimal(options.amount).toFixed(this.decimals);
  }

  /**
   * Convert the given amount from `USD` to `TFT` using the current conversion rate.
   *
   * @param options - The currency model containing the amount in `USD`.
   * @returns A string representation of the converted amount in `TFT`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  convertUSDtoTFT(options: CurrencyModel): string {
    const amount = options.amount / this.rate;
    return this.normalizeCurrency({ amount });
  }

  /**
   * Convert the given amount from `TFT` to `USD` using the current conversion rate.
   *
   * @param options - The currency model containing the amount in `TFT`.
   * @returns A string representation of the converted amount in `USD`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  convertTFTtoUSD(options: CurrencyModel): string {
    const amount = options.amount * this.rate;
    return this.normalizeCurrency({ amount });
  }

  /**
   * Changes the rate from hourly to daily.
   *
   * @param options - The currency model containing the amount in `TFT`.
   * @returns A string representation of the converted amount in `TFT`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  dailyTFT(options: CurrencyModel): string {
    const hours = options.amount * 24;
    return this.normalizeCurrency({ amount: hours });
  }

  /**
   * Changes the rate from hourly to monthly.
   *
   * @param options - The currency model containing the amount in `TFT`.
   * @returns A string representation of the converted amount in `TFT`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  monthlyTFT(options: CurrencyModel): string {
    const months = +this.dailyTFT(options) * 30;
    return this.normalizeCurrency({ amount: months });
  }

  /**
   * Changes the rate from hourly to yearly.
   *
   * @param options - The currency model containing the amount in TFT.
   * @returns A string representation of the converted amount in TFT.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  yearlyTFT(options: CurrencyModel): string {
    const years = +this.monthlyTFT(options) * 12;
    return this.normalizeCurrency({ amount: years });
  }

  /**
   * Changes the rate from hourly to daily.
   *
   * @param options - The currency model containing the amount in USD.
   * @returns A string representation of the converted amount in USD.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  dailyUSD(options: CurrencyModel): string {
    const hours = options.amount * 24;
    return this.normalizeCurrency({ amount: hours });
  }

  /**
   * Changes the rate from hourly to monthly.
   *
   * @param options - The currency model containing the amount in `USD`.
   * @returns A string representation of the converted amount in `USD`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  monthlyUSD(options: CurrencyModel): string {
    const months = +this.dailyUSD(options) * 30;
    return this.normalizeCurrency({ amount: months });
  }

  /**
   * Changes the rate from hourly to yearly.
   *
   * @param options - The currency model containing the amount in `USD`.
   * @returns A string representation of the converted amount in `USD`.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input options.
   */
  @expose
  @validateInput
  yearlyUSD(options: CurrencyModel): string {
    const years = +this.monthlyUSD(options) * 12;
    return this.normalizeCurrency({ amount: years });
  }
}

export { TFTUSDConversionService as currency };
