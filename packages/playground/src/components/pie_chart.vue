<template>
  <div :chartdata="props.chartdata">
    <Doughnut :data="data" :options="options" />
  </div>
</template>
<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  chartdata: any[];
}>();

const options = ref({
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      position: "top",
      display: true,
      padding: 10,
      text: "Reward for CU, SU & NU",
    },
  },
});
const data = computed(() => {
  return {
    labels: ["NU", "CU", "SU"],
    datasets: [
      {
        data: props.chartdata || [50, 100, 30],
        backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)"],
        hoverOffset: 4,
      },
    ],
  };
});
</script>

<script lang="ts">
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { computed, ref } from "vue";

export default {
  name: "PieChart",
};
</script>
