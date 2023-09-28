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
          <v-progress-circular :model-value="item.value" :size="150" :width="15" color="primary"
            >{{ item.value !== "NaN" ? item.value + "%" : "NaN" }}
          </v-progress-circular>
        </div>
      </div>
    </v-row>
    <v-row justify="center">
      <v-progress-circular v-if="loading" indeterminate color="primary" :size="50" class="mt-10 mb-10" />
      <v-btn rounded="lg" variant="flat" color="primary" v-if="!loading" class="mt-7" @click="getNodeHealthUrl">
        Check Node Health
      </v-btn>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, type NodeStats, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import { getNodeStates } from "@/explorer/utils/helpers";
import { nodeStatsInitializer, type ResourceWrapper } from "@/explorer/utils/types";
import { GrafanaStatistics } from "@/utils/getMetricsUrl";

export default {
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },
  async mounted() {
    this.resources = await this.getNodeResources();
    console.log(this.resources);
  },
  setup(props) {
    const resources = ref<ResourceWrapper[]>([]);
    const renamedResources = ["CPU", "RAM", "SSD", "HDD"];
    const loading = ref<boolean>(false);
    const nodeStats = ref<NodeStats>(nodeStatsInitializer);

    const getNodeHealthUrl = async () => {
      console.log(props.node);
      const grafana = new GrafanaStatistics(props.node);
      const nodeHealthUrl = await grafana.getUrl();
      window.open(nodeHealthUrl, "_blank");
    };

    const getNodeResources = async () => {
      loading.value = true;
      nodeStats.value = await getNodeStates(props.node.nodeId);
      console.log(nodeStats.value);

      return ["cru", "mru", "sru", "hru"].map((i, idx) => {
        const value =
          Reflect.get(nodeStats.value.total, i) != 0
            ? ((Reflect.get(nodeStats.value.used, i) + Reflect.get(nodeStats.value.system, i)) /
                Reflect.get(nodeStats.value.total, i)) *
              100
            : NaN;
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
      loading,
      getNodeResources,
      getNodeHealthUrl,
    };
  },
};
</script>
