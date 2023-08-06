<template>
  <Layout pageName="Calculator" :noFilter="true">
    <div class="d-flex margin-left">
      <h1>
        Resources Pricing Calculator
        <i class="fa fa-calculator" aria-hidden="true"></i>
      </h1>
      <span class="link">
        <a href="https://manual.grid.tf/cloud/cloudunits_pricing.html" target="_blank">Threefold Pricing</a>
      </span>
    </div>

    <v-divider />
    <br />
    <v-card>
      <v-form v-model="isValidInputs">
        <div class="card">
          <v-row>
            <v-col cols="5" class="mx-auto">
              <v-tooltip offset="5" top>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="Enter number of CPUs"
                    :rules="[...inputValidators, cruCheck]"
                    label="CPU"
                    suffix="vCores"
                    v-model="CRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>Number of virtual cores</span>
              </v-tooltip>
            </v-col>
            <v-col cols="5" class="mx-auto">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="Memory"
                    :rules="[...inputValidators, mruCheck]"
                    label="RAM"
                    suffix="GB"
                    v-model="MRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>The Memory in GB</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5" class="mx-auto">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="SSD Storage"
                    :rules="[...inputValidators, diskCheck(SRU)]"
                    label="Disk SSD"
                    suffix="GB"
                    v-model="SRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>The SSD capacity storage</span>
              </v-tooltip>
            </v-col>
            <v-col cols="5" class="mx-auto">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    placeholder="HDD Storage"
                    :rules="[...inputValidators, diskCheck(HRU)]"
                    label="Disk HDD"
                    suffix="GB"
                    v-model="HRU"
                    outlined
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <span>The HDD capacity storage</span>
              </v-tooltip>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="6" class="d-flex">
              <v-tooltip bottom nudge-right="40">
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on" v-bind="attrs" class="mx-auto">
                    <v-switch hide-details label="Certified Node" @change="certifiedToggle" />
                  </div>
                </template>
                <span> A certified node will receive 25% more reward compared to a non-certified node. </span>
              </v-tooltip>
              <v-tooltip bottom nudge-right="40">
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on" v-bind="attrs" class="mx-auto">
                    <v-switch hide-details label="With a Public IPv4" @change="IPV4Toggle" />
                  </div> </template
                ><span
                  >An Internet Protocol version 4 address that is globally unique and accessible over the internet</span
                >
              </v-tooltip>
              <v-tooltip bottom nudge-left="20">
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on" v-bind="attrs" class="mx-auto">
                    <v-switch
                      hide-details
                      label="Use current balance"
                      :disabled="!$store.state.credentials.account.address"
                      @change="getCurrentBalance"
                      v-model="useCurrentBalance"
                    />
                  </div>
                </template>
                <span v-if="!$store.state.credentials.account.address">You should select/create an account first</span>
                <span v-else>Use current balance to calculate the discount</span>
              </v-tooltip>
            </v-col>
            <v-col cols="5" class="mx-auto">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-bind="attrs"
                    v-on="on"
                    placeholder="Balance"
                    :rules="[...inputValidators]"
                    label="Balance"
                    suffix="TFT"
                    v-model="balance"
                    outlined
                  />
                </template>
                <span>The amount of TFT to calculate discount</span>
              </v-tooltip>
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
          <v-tooltip bottom nudge-bottom="12">
            <template v-slot:activator="{ on, attrs }">
              <span class="price">
                <p v-if="price.label === 'Dedicated Node'">
                  Cost of reserving a
                  <span class="name">{{ price.label + " " }}</span> of the same specifications
                </p>
                <p v-else>
                  Cost of reservation on a
                  <span class="name">{{ price.label !== undefined ? price.label + " " : " " }}</span>
                </p>
                <span class="package"> {{ price.packageName != "none" ? price.packageName + " Package: " : "" }}</span>
                ${{ price.price }}/month, {{ price.TFTs }} TFT/month
                <span class="pl-2" dark right v-bind="attrs" v-on="on">
                  <i class="fa-solid fa-circle-info"></i>
                </span> </span
            ></template>
            <span>{{ price.info }}</span>
          </v-tooltip>
        </div>
      </div>
    </v-card>
  </Layout>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

import { balanceInterface, getBalance } from "../../portal/lib/balance";
import { calCU, calSU, getPrices } from "../../portal/lib/nodes";
import Layout from "../components/Layout.vue";
type priceType = {
  label?: string;
  color: string;
  price: string;
  packageName: any;
  backgroundColor: string;
  TFTs: any;
  info: string;
};

@Component({
  components: {
    Layout,
  },
})
export default class Calculator extends Vue {
  IPV4 = false;
  isCertified = false;
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
  @Watch("IPV4")
  @Watch("isCertified")
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
  useCurrentBalance = false;
  _balanceTmp: string = this.balance;

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
      const price = (await this.calcPrice()) as any;
      const CU = calCU(+this.CRU, +this.MRU);
      const SU = calSU(+this.HRU, +this.SRU);
      const IPV4 = this.IPV4 ? 1 : 0;
      // apply 25% extra on certified node if selected
      const certifiedFactor = this.isCertified ? 1.25 : 1;

      const musd_month =
        (CU * price.cu.value + SU * price.su.value + IPV4 * price.ipu.value) * certifiedFactor * 24 * 30;

      const [dedicatedPrice, dedicatedPackage, sharedPrice, sharedPackage] = await this.calDiscount(musd_month);

      this.prices = [
        {
          label: "Dedicated Node",
          price: `${dedicatedPrice}`,
          color: this.discountPackages[dedicatedPackage].color,
          packageName: dedicatedPackage,
          backgroundColor: this.discountPackages[dedicatedPackage].backgroundColor,
          TFTs: (+dedicatedPrice / this.TFTPrice).toFixed(2),
          info: "A user can reserve an entire node then use it exclusively to deploy solutions",
        },
        {
          label: "Shared Node",
          price: `${sharedPrice}`,
          color: "#868686",
          packageName: sharedPackage,
          backgroundColor: this.discountPackages[sharedPackage].backgroundColor,
          TFTs: (+sharedPrice / this.TFTPrice).toFixed(2),
          info: "Shared Nodes allow several users to host various workloads on a single node",
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

  IPV4Toggle() {
    this.IPV4 = !this.IPV4;
    console.log("current balance: " + this.$store.state.credentials.balance.free);
  }

  certifiedToggle() {
    this.isCertified = !this.isCertified;
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
        duration: 1.5,
        discount: 20,
        backgroundColor: "#3b3b3b",
        color: "black",
      },
      bronze: {
        duration: 3,
        discount: 30,
        backgroundColor: "#F7B370",
        color: "#C17427",
      },
      silver: {
        duration: 6,
        discount: 40,
        backgroundColor: "#eeeeee",
        color: "#a9a9a9",
      },
      gold: {
        duration: 18,
        discount: 60,
        backgroundColor: "#ffed8b",
        color: "rgba(0,0,0,.4)",
      },
    };

    let dedicatedPackage = "none";
    let sharedPackage = "none";
    for (const pkg in this.discountPackages) {
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
  async getCurrentBalance() {
    if (!this.useCurrentBalance) {
      this.balance = this._balanceTmp;
      return;
    }
    try {
      getBalance(this.$api, this.$store.state.credentials.account.address).then((balance: balanceInterface) => {
        this.$store.state.credentials.balance.free = balance.free;
        this._balanceTmp = this.balance;
        this.balance = balance.free.toString();
      });
    } catch (error) {
      console.log("Can't fetch the current balance due to error: " + error);
    }
  }
}
</script>
<style>
.margin-left {
  margin-left: 20px;
}

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
}
.package {
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
