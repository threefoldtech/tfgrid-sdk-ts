<template>
  <card-details
    v-if="node.healthy"
    :loading="loading"
    title="CPU Benchmark"
    :items="cpuBenchmark"
    icon="mdi-cpu-64-bit"
    :error="errorMessage"
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
    const errorMessage = ref("");
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
      if (!gridStore.grid) {
        errorMessage.value = "Unable to load CPU Benchmark details; please connect your wallet and try again.";
        return;
      }
      if (props.node.healthy) {
        try {
          errorMessage.value = "";
          loading.value = true;
          await getNodeCPUBenchmarkCard();
        } catch (error) {
          console.log(error);
          errorMessage.value = "Failed to load CPU Benchmark details. Please try again later.";
        } finally {
          loading.value = false;
        }
      }
    });

    return {
      cpuBenchmark,
      loading,
      errorMessage,
    };
  },
};
</script>
