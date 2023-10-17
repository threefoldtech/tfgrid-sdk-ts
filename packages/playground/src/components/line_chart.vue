<template>
  <ChLine :data="data" :options="options" />
</template>
<script setup lang="ts">
import { Line } from "vue-chartjs";
ChartJS.register(...registerables);
const props = defineProps<{
  getTotalReward: (currentPrice: number) => number;
  getRoi: (price: number) => number;
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
          data: props.xs.map(x => props.getRoi(x) / 100),
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
        data: props.xs.map(x => props.getTotalReward(x)) || xs.map(x => props.getTotalReward(x)),
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
    } as (typeof Line)["props"]["chartOptions"];
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
  } as (typeof Line)["props"]["chartOptions"];
});
</script>

<script lang="ts">
import { Chart as ChartJS, registerables } from "chart.js";
import { computed } from "vue";

export default {
  name: "LineChart",
  components: { ChLine: Line },
};
</script>
