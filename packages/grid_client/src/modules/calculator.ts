import { PricingPolicy, QueryClient } from "@threefold/tfchain_client";

import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { CalculatorModel, CUModel, NUModel, SUModel } from "./models";
import { calculateDiscountPackage } from "./utils";

export interface PricingInfo {
  dedicatedPrice: number;
  dedicatedPackage: {
    package: string;
    discount: number;
  };
  sharedPrice: number;
  sharedPackage: {
    package: string;
    discount: number;
  };
}
export const discountPackages = {
  none: {
    duration: 0,
    discount: 0,
  },
  default: {
    duration: 1.5,
    discount: 20,
  },
  bronze: {
    duration: 3,
    discount: 30,
  },
  silver: {
    duration: 6,
    discount: 40,
  },
  gold: {
    duration: 18,
    discount: 60,
  },
};
const UNIT_FACTOR = 10 ** 7;
class Calculator {
  client: TFClient | QueryClient;
  private _policy: PricingPolicy;
  private _priceTFT: number;
  private lastTftPriceFetchTime: number = 0;
  private TFT_PRICE_CACHE_DURATION: number = 60 * 60 * 1000; // 1 hour
  /**
   * Calculator class for performing various calculations related to pricing and resources.
   *
   * @param {GridClientConfig} config - The configuration object for initializing the client.
   */
  constructor(config: GridClientConfig | QueryClient) {
    this.client = config instanceof QueryClient ? config : config.tfclient;
  }

  /**
   * Calculate the Compute Units (CU) based on the provided CUModel options.
   *
   * @param {CUModel} options - The options containing the number of vCores (cru) and memory (mru) in GB.
   * @returns {number} The calculated Compute Units (CU) based on the provided options.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  calCU(options: CUModel): number {
    const mru_used_1 = options.mru / 4;
    const cru_used_1 = options.cru / 2;
    const cu1 = mru_used_1 > cru_used_1 ? mru_used_1 : cru_used_1;

    const mru_used_2 = options.mru / 8;
    const cru_used_2 = options.cru;
    const cu2 = mru_used_2 > cru_used_2 ? mru_used_2 : cru_used_2;

    const mru_used_3 = options.mru / 2;
    const cru_used_3 = options.cru / 4;
    const cu3 = mru_used_3 > cru_used_3 ? mru_used_3 : cru_used_3;

    let cu = cu1 > cu2 ? cu2 : cu1;
    cu = cu > cu3 ? cu3 : cu;
    return cu;
  }

  /**
   * Calculate the Storage Units (SU) based on the provided SUModel options.
   *
   * @param {SUModel} options - The options containing the allocated storage (hru) in GB and used storage (sru) in GB.
   * @returns {number} The calculated Storage Units (SU) based on the provided options.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  calSU(options: SUModel): number {
    return options.hru / 1200 + options.sru / 200;
  }

  /**
   * Calculate the Network Units (NU) based on the provided NUModel options.
   *
   * @param {NUModel} options - The options containing the number of units (nu) in GB.
   * @returns {number} The calculated Network Units (NU) based on the provided options.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  calNU(options: NUModel): number {
    return (options.nu * 1000) / 1e7;
  }

  /**
   * Asynchronously retrieves the pricing policies from the client.
   *
   * @returns {Promise<PricingPolicy>} A promise that resolves to the pricing policies.
   */
  async getPrices(): Promise<PricingPolicy> {
    this._policy = await this.client.pricingPolicies.get({ id: 1 });
    return this._policy;
  }

  /**
   * This is a private helper method to retrieve the pricing policies from the client if they are not already initialized.
   *
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  private async _getPrices(): Promise<void> {
    if (!this._policy) {
      await this.getPrices();
    }
  }

  /**
   * Calculates the cost of a unique name per month.
   *
   * This function retrieves the price per hour for a unique name, and calculates the total cost in mUSD.
   *
   *
   * @returns {Promise<number>} - The price in USD for the unique name usage per month.
   */
  @validateInput
  async namePricing() {
    await this._getPrices();
    const uniqueNamePricePerHour = this._policy.uniqueName.value;
    const priceInUSD = uniqueNamePricePerHour / 10 ** 7;
    // return cost per month
    return priceInUSD * 24 * 30;
  }

  /**
   * Asynchronously retrieves the TFT price from the TFChain.
   *
   * @returns {Promise<number>} A promise that resolves to the TFT price.
   * @decorators
   * - `@expose`: Exposes the method for external use.
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async tftPrice(): Promise<number> {
    if (Date.now() - this.lastTftPriceFetchTime < this.TFT_PRICE_CACHE_DURATION) {
      return this._priceTFT;
    }
    const pricing = await this.client.tftPrice.get();
    this._priceTFT = this.client instanceof TFClient ? pricing : pricing / 1000;
    this.lastTftPriceFetchTime = Date.now();
    return this._priceTFT;
  }
  @expose
  @validateInput
  async convertTFTtoUSD(balanceTFT: number): Promise<number> {
    const price = await this.tftPrice();
    return price * balanceTFT;
  }

  /**
   * Asynchronously calculates the monthly cost unit-USD based on the provided options.
   *
   * @param {CalculatorModel} options - The calculator model options containing, sru, mru, and some other fields.
   * @returns {Promise<{ cost: number, dedicatedDiscount: number }>} A promise that resolves to an object containing the calculated monthly cost in unit-USD and the discount for dedication nodes.
   * @decorators
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @validateInput
  private async pricing(options: CalculatorModel): Promise<{ cost: number; dedicatedDiscount: number }> {
    await this._getPrices();
    const cu = this.calCU({ cru: options.cru, mru: options.mru });
    const su = this.calSU({ hru: options.hru, sru: options.sru });
    const nu = this.calNU({ nu: options.nu ? options.nu : 0 });

    const ipv4u = options.ipv4u ? 1 : 0;

    // certified node cotsts 25% more than DIY node
    const certifiedFactor = options.certified ? 1.25 : 1;

    // const in Unit-USD
    const cost =
      (cu * +this._policy.cu.value +
        su * +this._policy.su.value +
        ipv4u * this._policy.ipu.value +
        nu * +this._policy.nu.value) *
      certifiedFactor *
      24 *
      30;
    return { cost: cost, dedicatedDiscount: this._policy.discountForDedicationNodes };
  }

  /**
   * Asynchronously calculates the monthly cost in USD and discount packages based on the provided options.
   *
   * @param {CalculatorModel} options - The calculator model options containing various parameters.
   * @returns {Promise<PricingInfo>} A promise that resolves to an object containing the calculated prices and discount packages.
   * @decorators
   * - `@validateInput`: Validates the input parameters before execution.
   */
  @expose
  @validateInput
  async calculate(options: CalculatorModel): Promise<PricingInfo> {
    const pricing = await this.pricing(options);
    const TFTPrice = await this.tftPrice();

    // discount for Dedicated Nodes
    const discount = pricing.dedicatedDiscount;
    /**
     * Dedicated price in Unit-USD
     */
    let dedicatedPrice = pricing.cost - pricing.cost * (+discount / 100);
    /**
     * Shared price in Unit-USD
     */
    let sharedPrice = pricing.cost;

    /**
     * Balance in Unit-USD
     */
    let balance_in_unitUSD = 0;
    if (options.balance) {
      // convert balance to from TFT to Unit-USD
      balance_in_unitUSD = TFTPrice * options.balance * UNIT_FACTOR;
    }

    const { dedicatedPackage, sharedPackage } = calculateDiscountPackage(
      balance_in_unitUSD,
      dedicatedPrice,
      sharedPrice,
    );
    dedicatedPrice = dedicatedPrice - dedicatedPrice * (discountPackages[dedicatedPackage].discount / 100);
    sharedPrice = sharedPrice - sharedPrice * (discountPackages[sharedPackage].discount / 100);

    const dedicatedPriceUSD = dedicatedPrice / UNIT_FACTOR;
    const sharedPriceUSD = sharedPrice / UNIT_FACTOR;
    return {
      dedicatedPrice: dedicatedPriceUSD,
      dedicatedPackage: {
        package: dedicatedPackage,
        discount: discountPackages[dedicatedPackage].discount,
      },
      sharedPrice: sharedPriceUSD,
      sharedPackage: {
        package: sharedPackage,
        discount: discountPackages[sharedPackage].discount,
      },
    };
  }

  /**
   * Asynchronously calculates the monthly cost and discount packages based on the provided options and the user's balance.
   *
   * @param {CalculatorModel} options - The calculator model options containing various parameters.
   * @returns {Promise<PricingInfo>} A promise that resolves to an object containing the calculated prices and discount packages based on the user's balance.
   */
  async calculateWithMyBalance(options: CalculatorModel): Promise<PricingInfo> {
    let balance = options.balance;
    if (this.client instanceof TFClient) {
      const balances = await this.client.balances.getMyBalance();
      balance = balances.free;
    }
    const calculate = await this.calculate({
      cru: options.cru,
      mru: options.mru,
      hru: options.hru,
      sru: options.sru,
      ipv4u: options.ipv4u,
      certified: options.certified,
      balance: balance,
      nu: options.nu,
    });
    return calculate;
  }
}

export { Calculator as calculator };
