import { TFClient } from "../clients/tf-grid/client";
import { GridClientConfig } from "../config";
import { expose } from "../helpers/expose";
import { validateInput } from "../helpers/validator";
import { CalculatorModel, CUModel, SUModel } from "./models";

class Calculator {
  client: TFClient;

  constructor(config: GridClientConfig) {
    this.client = new TFClient(config.substrateURL, config.mnemonic, config.storeSecret, config.keypairType);
  }
  @expose
  @validateInput
  async calCU(options: CUModel) {
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
  @expose
  @validateInput
  async calSU(options: SUModel) {
    return options.hru / 1200 + options.sru / 200;
  }
  async getPrices() {
    const pricing = await this.client.pricingPolicies.get({ id: 1 });
    return pricing;
  }
  @expose
  @validateInput
  async tftPrice() {
    const pricing = await this.client.tftPrice.get();
    return pricing;
  }
  @validateInput
  private async pricing(options: CalculatorModel) {
    const price = await this.getPrices();
    const cu = await this.calCU({ cru: options.cru, mru: options.mru });
    const su = await this.calSU({ hru: options.hru, sru: options.sru });
    const ipv4u = options.ipv4u ? 1 : 0;

    // certified node cotsts 25% more than DIY node
    const certifiedFactor = options.certified ? 1.25 : 1;

    const musd_month =
      (cu * +price?.cu.value + su * +price?.su.value + ipv4u * price?.ipu.value) * certifiedFactor * 24 * 30;
    return { musd_month: musd_month, dedicatedDiscount: price.discountForDedicationNodes };
  }
  @expose
  @validateInput
  async calculate(options: CalculatorModel) {
    let balance = 0;
    const pricing = await this.pricing(options);

    // discount for Dedicated Nodes
    const discount = pricing.dedicatedDiscount;
    let dedicatedPrice = pricing.musd_month - pricing.musd_month * (+discount / 100);
    let sharedPrice = pricing.musd_month;
    const TFTPrice = await this.tftPrice();
    if (options.balance) {
      balance = TFTPrice * options.balance * 10000000;
    }

    const discountPackages = {
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

    let dedicatedPackage = "none";
    let sharedPackage = "none";
    for (const pkg in discountPackages) {
      if (balance > dedicatedPrice * discountPackages[pkg].duration) {
        dedicatedPackage = pkg;
      }
      if (balance > sharedPrice * discountPackages[pkg].duration) {
        sharedPackage = pkg;
      }
    }
    dedicatedPrice = (dedicatedPrice - dedicatedPrice * (discountPackages[dedicatedPackage].discount / 100)) / 10000000;
    sharedPrice = (sharedPrice - sharedPrice * (discountPackages[sharedPackage].discount / 100)) / 10000000;
    return {
      dedicatedPrice: dedicatedPrice,
      dedicatedPackage: dedicatedPackage,
      sharedPrice: sharedPrice,
      sharedPackage: sharedPackage,
    };
  }

  async calculateWithMyBalance(options: CalculatorModel) {
    const balances = await this.client.balances.getMyBalance();
    const balance = balances.free;
    const calculate = await this.calculate({
      cru: options.cru,
      mru: options.mru,
      hru: options.hru,
      sru: options.sru,
      ipv4u: options.ipv4u,
      certified: options.certified,
      balance: balance,
    });
    return calculate;
  }
}

export { Calculator as calculator };
