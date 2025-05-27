<template>
  <div class="d-flex flex-wrap space-between">
    <v-col sm="12" md="12" lg="5">
      <v-card class="my-3 pa-3">
        <v-row class="mt-1 px-4">
          <div class="d-flex align-center">
            <label class="label mr-2 mb-0">Basic</label>
            <v-switch v-model="isAdvanced" hide-details color="primary" inset />
            <span class="slider" />
            <label class="label ml-2">Advanced</label>
          </div>
        </v-row>
        <v-row>
          <v-card-text v-if="!isAdvanced">
            <b>Note:</b> Make sure to use base 1024 while filling in the simulator, otherwise there might be a different
            payout.
          </v-card-text>
        </v-row>
        <div class="mt-3 px-3">
          <input-validator
            :value="activeProfile.memory"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field v-model.number="activeProfile.memory" label="Memory (GB)" type="number" v-bind="props" />
          </input-validator>

          <input-validator
            :value="activeProfile.cpu"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field v-model.number="activeProfile.cpu" label="vCPU (Threads)" type="number" v-bind="props" />
          </input-validator>
          <input-validator
            v-if="props.chosenConfig == 'DIY'"
            :value="activeProfile.hdd"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field v-model.number="activeProfile.hdd" label="HDD (GB)" type="number" v-bind="props" />
          </input-validator>
          <input-validator
            :value="activeProfile.ssd"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field v-model.number="activeProfile.ssd" label="SSD (GB)" type="number" v-bind="props" />
          </input-validator>
          <input-validator
            :value="activeProfile.nuRequiredPerCu"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.nuRequiredPerCu"
              label="NU Required Per CU"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <input-validator
            :value="activeProfile.investmentCostHW"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.investmentCostHW"
              label="Hardware Cost (USD)"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <input-validator
            :value="activeProfile.price"
            :rules="[validators.min('Minimum TFT price allowed is 0.08 USD.', 0.08)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.price"
              label="Price of TFT at point of registration on blockchain (USD)"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <input-validator
            v-if="!isAdvanced"
            :value="activeProfile.maximumTokenPrice"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.maximumTokenPrice"
              label="Maximum Token Price"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <input-validator
            :value="activeProfile.powerUtilization"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.powerUtilization"
              label="Power Utilization (Watt)"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <input-validator
            :value="activeProfile.powerCost"
            :rules="[validators.min('Value must be positive.', 0)]"
            #="{ props }"
          >
            <v-text-field
              v-model.number="activeProfile.powerCost"
              label="Power Cost (USD)"
              type="number"
              v-bind="props"
            />
          </input-validator>
          <v-checkbox v-model="activeProfile.publicIp" color="title" label="Public IP" />

          <v-autocomplete
            v-if="props.chosenConfig == 'Titan v2.1'"
            v-model="certified"
            label="Certified"
            :items="[...certifications]"
            return-object
            item-title="name"
          />
        </div>
      </v-card>
    </v-col>
    <v-col sm="12" md="12" lg="7">
      <v-card class="my-3 pa-3">
        <v-card-text>
          <v-row v-if="!isAdvanced" class="mt-1 px-4">
            <div class="d-flex align-center">
              <label class="label mr-2 mb-0">Net Profit</label>
              <!-- <v-switch hide-details color="primary" v-model="isProfit" inset disabled /> -->
              <span class="slider" />
              <!-- <label class="label ml-2">Return On Investment</label> -->
            </div>
          </v-row>
          <v-row v-show="!isAdvanced">
            <v-col>
              <LineChart :xs="xs" :is-profit="isProfit" :get-total-reward="getTotalReward" :get-roi="getRoi" />
            </v-col>
          </v-row>
          <v-row v-show="isAdvanced">
            <v-col sm="12" md="6">
              <PieChart :chartdata="chartdata" />
            </v-col>
            <v-col v-if="isAdvanced" sm="12" md="6">
              <input-validator
                :value="activeProfile.powerCost"
                :rules="[validators.min('Value must be positive.', 0)]"
                #="{ props }"
              >
                <v-text-field
                  v-model.number="activeProfile.priceAfter5Years"
                  label="Token price after 5 years (USD)"
                  type="number"
                  v-bind="props"
                />
              </input-validator>

              <!-- <v-text-field disabled label="Return On Investment" v-model.number="ROI" /> -->
              <v-text-field v-model.number="netProfit" disabled label="Net Profit" type="number" />
              <v-text-field v-model.number="grossProfit" disabled label="Gross Profit" type="number" />
              <v-text-field v-model.number="totalCosts" disabled label="Total Costs" type="number" />
            </v-col>
          </v-row>
          <v-row v-if="isAdvanced" class="mt-3 px-3">
            <v-text-field
              v-model.number="totalFarmingRewardInTft"
              disabled
              label="Total Monthly Farming Reward In TFT"
              type="number"
            />
          </v-row>
          <v-row class="mt-3 px-0">
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="cu" disabled label="CU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="su" disabled label="SU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="nu" disabled label="NU" type="number" />
            </v-col>
          </v-row>

          <v-row class="mt-3 px-0">
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="rewardPerCu" disabled label="USD reward per CU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="rewardPerSu" disabled label="USD reward per SU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="rewardPerNu" disabled label="USD reward per NU" type="number" />
            </v-col>
          </v-row>

          <v-row v-if="isAdvanced" class="mt-3 px-0">
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="tftRewardPerCu" disabled label="TFT Reward Per CU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="tftRewardPerSu" disabled label="TFT Reward Per SU" type="number" />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field v-model.number="tftRewardPerNu" disabled label="TFT Reward Per NU" type="number" />
            </v-col>
          </v-row>

          <v-row v-if="isAdvanced" class="mt-3 px-0">
            <v-col sm="12" lg="4">
              <v-text-field
                v-model.number="cuFarmingRewardInTft"
                disabled
                label="CU Farming Reward In TFT"
                type="number"
              />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field
                v-model.number="suFarmingRewardInTft"
                disabled
                label="SU Farming Reward In TFT"
                type="number"
              />
            </v-col>
            <v-col sm="12" lg="4">
              <v-text-field
                v-model.number="nuFarmingRewardInTft"
                disabled
                label="NU Farming Reward In TFT"
                type="number"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";

import { Certification, type FarmingProfileOptions, ProfileTypes } from "@/types/index";

import LineChart from "./line_chart.vue";
import PieChart from "./pie_chart.vue";

const props = defineProps<{
  chosenConfig: string;
  profile: FarmingProfileOptions;
}>();

const certifications = ["No Certification", "Certified Node"];
const certified = ref();

const isAdvanced = ref(false);
const isProfit = ref(false);
const xs = ref<number[]>([]);
const activeProfile = ref(props.profile);

const chartdata = ref();
const rewardPerCu = ref(2.4);
const rewardPerSu = ref(1);
const rewardPerNu = ref(0.03);

const _max = (val: number, max = 0): number => {
  val = val ?? 0;
  return Math.max(val, max);
};

const cu = computed(() => {
  const x = (activeProfile.value.memory - 1) / 4;
  const y = activeProfile.value.cpu * 2;
  const z = activeProfile.value.ssd / 50;
  return _max(Math.min(x, y, z));
});

const nu = computed(() => _max(cu.value * activeProfile.value.nuRequiredPerCu));

const su = computed(() => {
  const x = activeProfile.value.hdd / 1200;
  const y = activeProfile.value.ssd * 0.8;
  return x + y / 200;
});

const averageTokenPrice = computed(() => (activeProfile.value.price + activeProfile.value.priceAfter5Years) / 2);

const tftRewardPer = computed(() => (activeProfile.value.certified ? 1 : 0) * 0.25 + 1);

const tftRewardPerCu = computed(() => {
  if (activeProfile.value.price < 0.08) return NaN;
  return (rewardPerCu.value / activeProfile.value.price) * tftRewardPer.value;
});

const tftRewardPerSu = computed(() => {
  if (activeProfile.value.price < 0.08) return NaN;
  return (rewardPerSu.value / activeProfile.value.price) * tftRewardPer.value;
});

const tftRewardPerNu = computed(() => rewardPerNu.value / averageTokenPrice.value);

const cuFarmingRewardInTft = computed(() => tftRewardPerCu.value * cu.value);
const suFarmingRewardInTft = computed(() => tftRewardPerSu.value * su.value);

const nuFarmingRewardInTft = computed(() => (activeProfile.value.publicIp ? tftRewardPerNu.value * nu.value : 0));

const totalFarmingRewardInTft = computed(
  () => cuFarmingRewardInTft.value + suFarmingRewardInTft.value + nuFarmingRewardInTft.value,
);
const getTotalReward = (currentPrice: number): number => {
  const tft = totalFarmingRewardInTft.value * 60;
  const grossProfit = tft * currentPrice;
  return grossProfit - totalCosts.value;
};

const getRoi = (price: number = activeProfile.value.priceAfter5Years): number => {
  const tft = totalFarmingRewardInTft.value * 60;
  const usd = tft * price;
  const powerCostOver5Years = activeProfile.value.powerUtilization * 24 * 0.365 * 5 * activeProfile.value.powerCost;
  const roiX = usd - (activeProfile.value.investmentCostHW + powerCostOver5Years);
  const roiY = activeProfile.value.investmentCostHW + powerCostOver5Years;
  const roi = roiX / roiY;
  return roi * 100;
};

const ROI = computed(() => getRoi().toFixed(0) + "%");

const grossProfit = computed(() => {
  const tft = totalFarmingRewardInTft.value * 60;
  return tft * activeProfile.value.priceAfter5Years;
});

const totalCosts = computed(() => {
  if (activeProfile.value.price < 0.08) return NaN;
  const powerCostOver5Years = activeProfile.value.powerUtilization * 24 * 0.365 * 5 * activeProfile.value.powerCost;
  return powerCostOver5Years + activeProfile.value.investmentCostHW;
});

const netProfit = computed(() => grossProfit.value - totalCosts.value);

watch([activeProfile.value, isProfit, isAdvanced, certified], () => {
  console.log("ROI", ROI.value);
  if (certified.value == "Certified Node") {
    activeProfile.value.certified = Certification.CERTIFIED;
  } else {
    activeProfile.value.certified = Certification.NONE;
  }

  updatePieChart();
  updateLineChart();
});

onMounted(() => {
  updateLineChart();
  updatePieChart();
});

const updateLineChart = () => {
  const price = activeProfile.value
    ? isProfit.value
      ? activeProfile.value.priceAfter5Years
      : activeProfile.value.maximumTokenPrice
    : 0;

  if (activeProfile.value) {
    const X = (price - 0.01) / 19;
    xs.value = [...Array.from({ length: 10 }).map((_, i) => 0.01 + X * i)];
  }
};
function updatePieChart() {
  chartdata.value = [nuFarmingRewardInTft.value, cuFarmingRewardInTft.value, suFarmingRewardInTft.value];
}
</script>

<script lang="ts">
export function createFarmingProfile(options: Partial<FarmingProfileOptions> = {}): FarmingProfileOptions {
  return {
    type: options.type || ProfileTypes.DIY,
    name: options.name || "DIY",
    memory: options.memory || 0,
    cpu: options.cpu || 0,
    hdd: options.hdd || 0,
    ssd: options.ssd || 0,
    price: options.price || 0.09,
    priceAfter5Years: options.priceAfter5Years || 1,
    maximumTokenPrice: options.maximumTokenPrice || 2,
    powerUtilization: options.powerUtilization || 40,
    powerCost: options.powerCost || 0.15,
    certified: options.certified || Certification.NONE,
    publicIp: options.publicIp || false,
    investmentCostHW: options.investmentCostHW || 2200,
    nuRequiredPerCu: options.nuRequiredPerCu || 30,
  };
}
export default {
  name: "SimulatorFarming",
};
</script>

<style scoped>
.label {
  font-size: 0.875rem;
}

@media (max-width: 600px) {
  .v-col {
    flex-basis: auto !important;
  }
}
</style>
