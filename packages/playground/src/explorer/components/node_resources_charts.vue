<template>
  <div class="node-resources">
    <v-row justify="center">
      <v-col cols="8">
        <h2 class="node-resources-title text-center text-h4 flex justify-center items-center">
          <v-icon size="40" class="mr-2">mdi-chart-pie</v-icon>
          Node {{ node.nodeId }} Resources
          <span :style="'color:' + (node.status === NodeStatus.Up ? '#4caf50' : '#f44336')">{{
            node.status === NodeStatus.Up ? "[Online]" : "Offline"
          }}</span>
        </h2>
      </v-col>
    </v-row>

    <v-row justify="center">
      <div v-for="item in resources" :key="item.name" class="mx-6 d-flex flex-column pt-2 mt-2 align-center">
        <div class="mb-2">{{ item.name }}</div>
        <div class="text-center">
          <v-progress-circular :model-value="item.value" :size="150" :width="15" color="primary"
            >{{ item.value !== "NaN" ? item.value + "%" : "N/A" }}
          </v-progress-circular>
        </div>
      </div>
    </v-row>

    <v-row justify="center">
      <v-progress-circular v-if="loading" indeterminate color="primary" :size="50" class="mt-10 mb-10" />
      <v-btn rounded="lg" variant="flat" color="primary" v-if="!loading" class="mt-15" @click="getNodeHealthUrl">
        Check Node Health
      </v-btn>
    </v-row>
  </div>
</template>

<script lang="ts">
import GridProxyClient, { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import type { ResourceWrapper } from "@/explorer/utils/types";
import { GrafanaStatistics } from "@/utils/getMetricsUrl";

export default {
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
    gridProxyClient: {
      type: Object as PropType<GridProxyClient>,
      required: true,
    },
  },
  async mounted() {
    this.resources = await this.getNodeResources();
  },
  setup(props) {
    const resources = ref<ResourceWrapper[]>([]);
    const renamedResources = ["CPU", "RAM", "SSD", "HDD"];
    const loading = ref<boolean>(false);

    const getNodeHealthUrl = async () => {
      const grafana = new GrafanaStatistics(props.node);
      const nodeHealthUrl = await grafana.getUrl();
      window.open(nodeHealthUrl, "_blank");
    };

    const getNodeResources = async () => {
      loading.value = true;
      return ["cru", "mru", "sru", "hru"].map((i, idx) => {
        let value;
        if (props.node.stats && props.node.stats.system) {
          value =
            ((Reflect.get(props.node.stats.used, i) + Reflect.get(props.node.stats.system, i)) /
              Reflect.get(props.node.stats.total, i)) *
            100;
        } else {
          value = NaN;
        }
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
