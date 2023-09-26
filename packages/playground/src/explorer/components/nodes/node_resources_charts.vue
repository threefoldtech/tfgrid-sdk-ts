<template>
  <div class="node-resources mt-10">
    <v-row justify="center">
      <v-col cols="8">
        <h2 class="node-resources-title text-center text-h4 flex justify-center items-center">
          <v-icon size="40" class="mr-2">mdi-chart-pie</v-icon>
          Node Resources
          <span :style="'color:' + (node.status === NodeStatus.Up ? '#4caf50' : '#f44336')">{{
            node.status === NodeStatus.Up ? "[Online]" : "Offline"
          }}</span>
        </h2>
      </v-col>
    </v-row>
    <!-- Details -->
    <v-row justify="center">
      <div v-for="item in resources" :key="item.name" class="mx-6 d-flex flex-column pt-2 mt-2 align-center">
        <div class="mb-2">{{ item.name }}</div>
        <div class="text-center">
          <v-progress-circular
            :model-value="isNaN(+item.value) ? 0 : item.value"
            :size="150"
            :width="15"
            color="primary"
            v-if="isNaN(+item.value)"
            >NA
          </v-progress-circular>
          <v-progress-circular
            :model-value="isNaN(+item.value) ? 0 : item.value"
            :size="150"
            :width="15"
            color="primary"
            v-else
            >{{ item.value }}%
          </v-progress-circular>
        </div>
      </div>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import type { ResourceWrapper } from "@/explorer/utils/types";

export default {
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },
  mounted() {
    this.getNodeResources();
  },
  setup(props) {
    const resources = ref<ResourceWrapper[]>([]);
    const renamedResources = ["CPU", "RAM", "SSD", "HDD"];
    const loading = ref<boolean>(false);
    const nodeStatistics = {};

    const getNodeResources = () => {
      loading.value = true;
      return ["cru", "mru", "sru", "hru"].map((i, idx) => {
        const value =
          nodeStatistics.value.total[i] != 0
            ? ((nodeStatistics.value.used[i] + nodeStatistics.value.system[i]) / nodeStatistics.value.total[i]) * 100
            : NaN; // prettier-ignore, validate if the total is zero so the usage is set to NaN else do the division
        loading.value = false;
        return {
          id: idx + 1,
          value: value.toFixed(2),
          name: renamedResources[idx],
        };
      });
    };

    return {
      NodeStatus,
      resources,
      getNodeResources,
    };
  },
};
</script>
