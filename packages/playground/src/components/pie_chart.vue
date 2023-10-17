<template>
  <ChDoughnut :data="data" :options="options" />
</template>
<script setup lang="ts">
ChartJS.register(...registerables);

const props = defineProps<{
  chartdata: any[];
}>();

const options = ref<(typeof Doughnut)["props"]["chartOptions"]>({
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
import { Chart as ChartJS, registerables } from "chart.js";
import { computed, ref } from "vue";
import { Doughnut } from "vue-chartjs";

export default {
  name: "PieChart",
  components: { ChDoughnut: Doughnut },
};
</script>
