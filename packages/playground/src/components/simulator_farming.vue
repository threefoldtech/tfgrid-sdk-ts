<template>
  <div class="d-flex flex-wrap space-between mt-3">
    <v-card width="40%" class="my-3 mr-5 pa-3">
      <v-row class="mt-1 px-4">
        <div class="d-flex align-center">
          <label class="label mr-2 mb-0">Basic</label>
          <v-switch hide-details color="primary" v-model="isAdvanced" inset />
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
          <v-text-field label="Memory (GB)" type="number" v-model.number="activeProfile.memory" v-bind="props" />
        </input-validator>

        <input-validator
          :value="activeProfile.cpu"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field label="vCPU (Threads)" type="number" v-model.number="activeProfile.cpu" v-bind="props" />
        </input-validator>
        <input-validator
          v-if="props.chosenConfig == 'DIY'"
          :value="activeProfile.hdd"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field label="HDD (GB)" type="number" v-model.number="activeProfile.hdd" v-bind="props" />
        </input-validator>
        <input-validator
          :value="activeProfile.ssd"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field label="SSD (GB)" type="number" v-model.number="activeProfile.ssd" v-bind="props" />
        </input-validator>
        <input-validator
          :value="activeProfile.nuRequiredPerCu"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field
            label="NU Required Per CU"
            type="number"
            v-model.number="activeProfile.nuRequiredPerCu"
            v-bind="props"
          />
        </input-validator>
        <input-validator
          :value="activeProfile.investmentCostHW"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field
            label="Hardware Cost (USD)"
            type="number"
            v-model.number="activeProfile.investmentCostHW"
            v-bind="props"
          />
        </input-validator>
        <input-validator
          :value="activeProfile.price"
          :rules="[validators.min('Minimum TFT price allowed is 0.08 USD.', 0.08)]"
          #="{ props }"
        >
          <v-text-field
            label="Price of TFT at point of registration on blockchain (USD)"
            type="number"
            v-model.number="activeProfile.price"
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
            label="Maximum Token Price"
            type="number"
            v-model.number="activeProfile.maximumTokenPrice"
            v-bind="props"
          />
        </input-validator>
        <input-validator
          :value="activeProfile.powerUtilization"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field
            label="Power Utilization (Watt)"
            type="number"
            v-model.number="activeProfile.powerUtilization"
            v-bind="props"
          />
        </input-validator>
        <input-validator
          :value="activeProfile.powerCost"
          :rules="[validators.min('Value must be positive.', 0)]"
          #="{ props }"
        >
          <v-text-field
            label="Power Cost (USD)"
            type="number"
            v-model.number="activeProfile.powerCost"
            v-bind="props"
          />
        </input-validator>
        <v-checkbox color="title" v-model="activeProfile.publicIp" label="Public IP" />

        <v-autocomplete
          v-if="props.chosenConfig == 'Titan v2.1'"
          label="Certified"
          :items="[...certifications]"
          return-object
          item-title="name"
          v-model="certified"
        />
      </div>
    </v-card>

    <v-card width="58%" class="my-3 pa-3">
      <v-card-text>
        <v-row class="mt-1 px-4" v-if="!isAdvanced">
          <div class="d-flex align-center">
            <label class="label mr-2 mb-0">Net Profit</label>
            <v-switch hide-details color="primary" v-model="isProfit" inset />
            <span class="slider" />
            <label class="label ml-2">Return On Investment</label>
          </div>
        </v-row>
        <v-row v-show="!isAdvanced">
          <v-col>
            <LineChart :fp="activeProfile" :xs="xs" :isProfit="isProfit" />
          </v-col>
        </v-row>
        <v-row v-show="isAdvanced">
          <v-col cols="6">
            <PieChart :chartdata="chartdata" />
          </v-col>
          <v-col cols="6" v-if="isAdvanced">
            <input-validator
              :value="activeProfile.powerCost"
              :rules="[validators.min('Value must be positive.', 0)]"
              #="{ props }"
            >
              <v-text-field
                label="Token price after 5 years (USD)"
                type="number"
                v-model.number="activeProfile.priceAfter5Years"
                v-bind="props"
              />
            </input-validator>

            <v-text-field disabled label="Return On Investment" type="number" v-model.number="activeProfile.ROI" />
            <v-text-field disabled label="Net Profit" type="number" v-model.number="activeProfile.netProfit" />
            <v-text-field disabled label="Gross Profit" type="number" v-model.number="activeProfile.grossProfit" />
            <v-text-field disabled label="Total Costs" type="number" v-model.number="activeProfile.totalCosts" />
          </v-col>
        </v-row>
        <v-row class="mt-3 px-3" v-if="isAdvanced">
          <v-text-field
            disabled
            label="Total Monthly Farming Reward In TFT"
            type="number"
            v-model.number="activeProfile.totalFarmingRewardInTft"
          />
        </v-row>
        <v-row class="mt-3 px-0">
          <v-col cols="4">
            <v-text-field disabled label="CU" type="number" v-model.number="activeProfile.cu" />
          </v-col>
          <v-col cols="4">
            <v-text-field disabled label="SU" type="number" v-model.number="activeProfile.su" />
          </v-col>
          <v-col cols="4">
            <v-text-field disabled label="NU" type="number" v-model.number="activeProfile.nu" />
          </v-col>
        </v-row>

        <v-row class="mt-3 px-0">
          <v-col cols="4">
            <v-text-field disabled label="USD reward per CU" type="number" v-model.number="activeProfile.rewardPerCu" />
          </v-col>
          <v-col cols="4">
            <v-text-field disabled label="USD reward per SU" type="number" v-model.number="activeProfile.rewardPerSu" />
          </v-col>
          <v-col cols="4">
            <v-text-field disabled label="USD reward per NU" type="number" v-model.number="activeProfile.rewardPerNu" />
          </v-col>
        </v-row>

        <v-row class="mt-3 px-0" v-if="isAdvanced">
          <v-col cols="4">
            <v-text-field
              disabled
              label="TFT Reward Per CU"
              type="number"
              v-model.number="activeProfile.tftRewardPerCu"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              disabled
              label="TFT Reward Per SU"
              type="number"
              v-model.number="activeProfile.tftRewardPerSu"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              disabled
              label="TFT Reward Per NU"
              type="number"
              v-model.number="activeProfile.tftRewardPerNu"
            />
          </v-col>
        </v-row>

        <v-row class="mt-3 px-0" v-if="isAdvanced">
          <v-col cols="4">
            <v-text-field
              disabled
              label="CU Farming Reward In TFT"
              type="number"
              v-model.number="activeProfile.cuFarmingRewardInTft"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              disabled
              label="SU Farming Reward In TFT"
              type="number"
              v-model.number="activeProfile.suFarmingRewardInTft"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              disabled
              label="NU Farming Reward In TFT"
              type="number"
              v-model.number="activeProfile.nuFarmingRewardInTft"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

import FarmingProfile, { Certification, ProfileTypes } from "@/utils/simulator";

import LineChart from "./line_chart.vue";
import PieChart from "./pie_chart.vue";

const props = defineProps<{
  chosenConfig: string;
}>();

const certifications = ["No Certification", "Certified Node"];
const certified = ref();

const isAdvanced = ref(false);
const isProfit = ref(false);
const xs = ref<number[]>([]);

const chartdata = ref();
const activeProfile = ref(
  new FarmingProfile({
    type: ProfileTypes.DIY,
    name: "DIY",
    memory: 32,
    cpu: 8,
    hdd: 10000,
    ssd: 1000,
    price: 0.08,
    priceAfter5Years: 1,
  }),
);

watch([activeProfile.value, isProfit, isAdvanced, certified], () => {
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
  if (props.chosenConfig == "Titan v2.1") {
    activeProfile.value = new FarmingProfile({
      type: ProfileTypes.TITAN,
      name: "Titan v2.1",
      memory: 32,
      cpu: 8,
      hdd: 0,
      ssd: 1000,
      price: 0.08,
      priceAfter5Years: 1,
      investmentCostHW: 800,
    });
  }
});

const updateLineChart = () => {
  const price = activeProfile.value
    ? isProfit.value
      ? activeProfile.value.priceAfter5Years
      : activeProfile.value.maximumTokenPrice
    : 0; // Provide a default value if activeProfile is not available

  if (activeProfile.value) {
    const X = (price - 0.15) / 19;
    xs.value = [...Array.from({ length: 20 }).map((_, i) => 0.15 + X * i)];
  }
};
function updatePieChart() {
  const { nuFarmingRewardInTft, cuFarmingRewardInTft, suFarmingRewardInTft } = activeProfile.value;
  chartdata.value = [nuFarmingRewardInTft, cuFarmingRewardInTft, suFarmingRewardInTft];
}
</script>

<script lang="ts">
export default {
  name: "SimulatorFarming",
};
</script>
