<template>
  <div :fp="fp" :xs="xs" :isProfit="isProfit">
    <Line :data="data" :options="options" />
  </div>
</template>
<script setup lang="ts">
import { Line } from "vue-chartjs";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const props = defineProps<{
  fp: FarmingProfile;
  xs: number[];
  isProfit: boolean;
}>();
const X = (20 - 0.15) / 19;
const xs = [...Array.from({ length: 20 }).map((_, i) => 0.15 + X * i)];
const data = computed(() => {
  if (props.isProfit) {
    return {
      labels: props.xs.map(i => i.toFixed(2)) || xs.map(i => i.toFixed(2)),
      datasets: [
        {
          label: "ROI",
          data: props.xs.map(x => props.fp.getRoi(x) / 100),
          backgroundColor: "rgb(26, 161, 143)",
          borderColor: "rgba(26, 161, 143, 0.5)",
          pointRadius: 3,
        },
      ],
    };
  }
  return {
    labels: props.xs.map(i => i.toFixed(2)) || xs.map(i => i.toFixed(2)),
    datasets: [
      {
        label: "Margin",
        data: props.xs.map(x => props.fp.getTotalReward(x)) || xs.map(x => props.fp.getTotalReward(x)),
        backgroundColor: "rgb(26, 161, 143)",
        borderColor: "rgba(26, 161, 143, 0.5)",
        pointRadius: 3,
      },
    ],
  };
});

const options = computed(() => {
  if (props.isProfit) {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: "Return (USD) / TFT price (USD)",
        },
      },
    };
  }
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: "Return (USD) / TFT price (USD)",
      },
    },
  };
});

const options2 = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Return (USD) / TFT price (USD)",
    },
  },
};
</script>

<script lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { computed } from "vue";

import type FarmingProfile from "@/utils/simulator";
export default {
  name: "LineChart",
};
</script>
