<template>
  <card-details
    v-if="node.healthy"
    :loading="loading"
    title="CPU Benchmark"
    :items="cpuBenchmark"
    icon="mdi-cpu-64-bit"
  />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { CPUBenchmark, NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import { useGrid } from "../../stores";
import CardDetails from "./card_details.vue";

export default {
  name: "cpuBenchmarkCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const gridStore = useGrid();
    const loading = ref<boolean>(false);
    const cpuBenchmark = ref<NodeDetailsCard[]>();

    function format(val: number | undefined) {
      return val ? val.toString() : "-";
    }
    const getNodeCPUBenchmarkCard = async (): Promise<NodeDetailsCard[]> => {
      const res = await gridStore.grid.zos.getNodeCPUTest({ nodeId: props.node.nodeId });
      let multi, single, threads;
      if (res.result) {
        ({ multi, single, threads } = res.result as CPUBenchmark);
      }
      return (cpuBenchmark.value = [
        { name: "Multi", value: format(multi) },
        { name: "Single", value: format(single) },
        { name: "Threads", value: format(threads) },
      ]);
    };

    onMounted(async () => {
      if (props.node.healthy) {
        try {
          loading.value = true;
          await getNodeCPUBenchmarkCard();
        } catch (error) {
          createCustomToast("Failed to load CPU Benchmark details. Please try again later.", ToastType.danger);
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      cpuBenchmark,
      loading,
    };
  },
};
</script>
