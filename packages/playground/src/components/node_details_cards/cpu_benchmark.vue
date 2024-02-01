<template>
  <card-details
    v-if="node.status === 'up'"
    :loading="loading"
    title="CPU Benchmark"
    :items="cpuBenchmark"
    icon="mdi-cpu-64-bit"
  />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
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

    onMounted(async () => {
      try {
        loading.value = true;
        await getNodeCPUBenchmarkCard();
      } catch (error) {
        createCustomToast("Failed to load CPU Benchmark details. Please try again later.", ToastType.danger);
      } finally {
        loading.value = false;
      }
    });

    const getNodeCPUBenchmarkCard = async (): Promise<NodeDetailsCard[]> => {
      const res = await gridStore.grid.zos.getNodeCPUTest({ nodeId: props.node.nodeId });
      const { multi, single, threads, workloads } = res.result;
      cpuBenchmark.value = [
        { name: "Multi", value: multi || "-" },
        { name: "Single", value: single || "-" },
        { name: "Threads", value: threads || "-" },
        { name: "Workloads", value: workloads || "-" },
      ];
      return cpuBenchmark.value;
    };

    return {
      cpuBenchmark,
      loading,
    };
  },
};
</script>
