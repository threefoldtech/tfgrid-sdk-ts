<template>
  <Layout pageName="Calculator" :noFilter="true">
    <div class="d-flex justify-left">
      <h1>
        Resources Pricing Calculator
        <i class="fa fa-calculator" aria-hidden="true"></i>
      </h1>
      <span class="link">
        <a href="https://library.threefold.me/info/threefold/#/tfgrid/pricing/threefold__pricing" target="_blank"
          >Threefold Pricing</a
        >
      </span>
    </div>

    <v-divider />
    <br />
    <v-card>
      <v-form v-model="isValidInputs">
        <div class="card">
          <v-row>
            <v-col cols="5" class="mx-auto">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="Enter number of CPUs"
                    :rules="[...inputValidators, cruCheck]"
                    label="CRU"
                    suffix="vCores"
                    v-model="CRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>CPU</span>
              </v-tooltip>
            </v-col>
            <v-col cols="5" class="mx-auto">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="Memory"
                    :rules="[...inputValidators, mruCheck]"
                    label="MRU"
                    suffix="GB"
                    v-model="MRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>RAM</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5" class="mx-auto">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="SSD Storage"
                    :rules="[...inputValidators, diskCheck(SRU)]"
                    label="SRU"
                    suffix="GB"
                    v-model="SRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>SSD</span>
              </v-tooltip>
            </v-col>
            <v-col cols="5" class="mx-auto">
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="HDD Storage"
                    :rules="[...inputValidators, diskCheck(HRU)]"
                    label="HRU"
                    suffix="GB"
                    v-model="HRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>HDD</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5" class="mx-auto">
              <v-text-field
                placeholder="Your Balance"
                :rules="[...inputValidators]"
                label="Your Balance"
                suffix="TFT"
                v-model="balance"
                outlined
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-form>

      <div class="row pb-5 px-4 mx-5" v-if="isValidInputs">
        <div
          class="col-5 price-box"
          v-for="price in prices"
          :key="price.price"
          :style="{ color: price.color, background: price.backgroundColor }"
        >
          <span class="price">
            <span class="name">
              {{ price.label !== undefined ? price.label + " " : " " }}
              {{ price.packageName != "none" ? price.packageName + " Package" : "" }}</span
            >
            : ${{ price.price }}/month, {{ price.TFTs }} TFT/month
          </span>
        </div>
      </div>
    </v-card>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Layout from "../components/Layout.vue";
import { calCU, calSU, getPrices } from "../../portal/lib/nodes";

type priceType = {
  label?: string;
  color: string;
  price: string;
  packageName: any;
  backgroundColor: string;
  TFTs: any;
};

@Component({
  components: {
    Layout,
  },
})
export default class Calculator extends Vue {
  CRU = "1";
  SRU = "25";
  MRU = "1";
  HRU = "100";
  balance = "0";
  @Watch("CRU")
  @Watch("SRU")
  @Watch("MRU")
  @Watch("HRU")
  @Watch("balance")
  @Watch("isValidInputs")
  calcWatcher() {
    this.calculate();
  }
  prices: priceType[] | [] = [];
  $api: any;
  discountPackages: any = {};
  formHasErrors = false;
  pricing: any;
  TFTPrice: number | undefined;
  isValidInputs = true;
  cruCheck() {
    // eslint-disable-next-line
    const CRURegex = /^\d+$/;
    if (!this.CRU) {
      return "This value is required";
    }
    if (+this.CRU === 0 || +this.CRU > 256) {
      return "CRU value must be between 1 and 256";
    }
    if (CRURegex.test(this.CRU)) {
      return true;
    } else {
      return "CRU value must be a positive integer";
    }
  }
  mruCheck() {
    if (!this.MRU) {
      return "This value is required";
    }
    if (+this.MRU > 1024) {
      return "Maximum allowed MRU value is 1024";
    } else {
      return true;
    }
  }
  diskCheck(val: string) {
    if (+val > 1000000) {
      return "Maximum disk size is 1000000 GB";
    } else if (!val) {
      return "disk field is required";
    } else {
      return true;
    }
  }
  inputValidators = [
    (val: string) => !isNaN(+val) || "This field must be a number",
    (val: string) => +val >= 0 || "This field must be a positive number",
  ];
  get formHasErrrs() {
    return this.$refs.form;
  }
  async created() {
    await this.calculate();
  }

  isInvalidValues() {
    return (
      this.balance.length === 0 ||
      this.CRU.length === 0 ||
      this.HRU.length === 0 ||
      this.SRU.length === 0 ||
      this.MRU.length === 0 ||
      isNaN(+this.balance) ||
      isNaN(+this.CRU) ||
      isNaN(+this.HRU) ||
      isNaN(+this.SRU) ||
      isNaN(+this.MRU) ||
      +this.balance < 0 ||
      +this.CRU < 0 ||
      +this.HRU < 0 ||
      +this.SRU < 0 ||
      +this.MRU < 0
    );
  }

  async calculate() {
    if (!this.isValidInputs) return;
    else if (this.$api) {
      if (this.isInvalidValues()) return;
      this.TFTPrice = await this.getTFTPrice(this.$api);
      const price = await this.calcPrice();
      const CU = calCU(+this.CRU, +this.MRU);
      const SU = calSU(+this.HRU, +this.SRU);
      const musd_month = (CU * price.cu.value + SU * price.su.value) * 24 * 30;
      const [dedicatedPrice, dedicatedPackage, sharedPrice, sharedPackage] = await this.calDiscount(musd_month);
      this.prices = [
        {
          label: "Dedicated Node Price",
          price: `${dedicatedPrice}`,
          color: this.discountPackages[dedicatedPackage].color,
          packageName: dedicatedPackage,
          backgroundColor: this.discountPackages[dedicatedPackage].backgroundColor,
          TFTs: (+dedicatedPrice / this.TFTPrice).toFixed(2),
        },
        {
          label: "Shared Node Price",
          price: `${sharedPrice}`,
          color: "#868686",
          packageName: sharedPackage,
          backgroundColor: this.discountPackages[sharedPackage].backgroundColor,
          TFTs: (+sharedPrice / this.TFTPrice).toFixed(2),
        },
      ];
    } else {
      this.$router.push({
        name: "accounts",
        path: "/",
      });
      return;
    }
  }

  async calcPrice() {
    const price = await getPrices(this.$api);
    return price;
  }

  async calDiscount(price: number) {
    this.pricing = await this.calcPrice();
    // discount for Dedicated Nodes
    const discount = this.pricing.discountForDedicationNodes;
    let dedicatedPrice = price - price * (discount / 100);
    let sharedPrice = price;

    // discount for Twin Balance in TFT
    const balance = (this.TFTPrice ? this.TFTPrice : 1) * +this.balance * 10000000;

    this.discountPackages = {
      none: {
        duration: 0,
        discount: 0,
        backgroundColor: "#CCCCCC",
        color: "#868686",
      },
      default: {
        duration: 3,
        discount: 20,
        backgroundColor: "#3b3b3b",
        color: "black",
      },
      bronze: {
        duration: 6,
        discount: 30,
        backgroundColor: "#F7B370",
        color: "#C17427",
      },
      silver: {
        duration: 12,
        discount: 40,
        backgroundColor: "#eeeeee",
        color: "#a9a9a9",
      },
      gold: {
        duration: 36,
        discount: 60,
        backgroundColor: "#ffed8b",
        color: "rgba(0,0,0,.4)",
      },
    };

    let dedicatedPackage = "none";
    let sharedPackage = "none";
    for (let pkg in this.discountPackages) {
      if (balance > dedicatedPrice * this.discountPackages[pkg].duration) {
        dedicatedPackage = pkg;
      }
      if (balance > sharedPrice * this.discountPackages[pkg].duration) {
        sharedPackage = pkg;
      }
    }
    dedicatedPrice =
      (dedicatedPrice - dedicatedPrice * (this.discountPackages[dedicatedPackage].discount / 100)) / 10000000;
    sharedPrice = (sharedPrice - sharedPrice * (this.discountPackages[sharedPackage].discount / 100)) / 10000000;
    return [dedicatedPrice.toFixed(2), dedicatedPackage, sharedPrice.toFixed(2), sharedPackage];
  }

  async getTFTPrice(api: { query: { tftPriceModule: { tftPrice: any } } }) {
    const pricing = await api.query.tftPriceModule.tftPrice();
    return pricing.words[0] / 1000;
  }
}
</script>
<style>
.right {
  text-align: right;
  margin-right: 0;
  margin-left: auto;
}
.calc_input {
  width: 100px;
  border-bottom: 1px solid rgb(175, 47, 47);
  padding: 10px;
  font-size: 1.5em;
  font-weight: bold;
  color: #000;
  background-color: #fff;
  outline: none;
}
.card {
  padding: 5rem;
}
.price-box {
  font-size: 1.3rem;
  font-weight: bold;
  text-align: center;
  margin: 0.2rem auto;
  border-radius: 5px;
}
.price {
  display: block;
  padding: 0.7rem;
  display: inline-block;
  margin: 0 auto;
  text-align: center;
}
.name {
  font-weight: 900;
  text-transform: capitalize;
}
.link {
  align-self: end;
  display: inline-block;
  margin-left: 1rem;
  margin-bottom: 0.3rem;
}
</style>
