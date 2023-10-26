<template>
  <div class="node-resources mt-10">
    <v-row justify="center">
      <v-col cols="8">
        <h2 class="node-resources-title text-center text-h5 flex justify-center items-center">
          <v-icon size="32" class="mr-2">mdi-chart-pie</v-icon>
          Node {{ node.nodeId }} Resources
          <v-chip :color="getNodeStatusColor(node.status).color">
            {{ node.status === NodeStatus.Up ? "Online" : node.status === NodeStatus.Standby ? "Standby" : "Offline" }}
          </v-chip>
        </h2>
      </v-col>
    </v-row>

    <v-row justify="center">
      <div v-for="item in resources" :key="item.name" class="mx-6 d-flex flex-column pt-2 mt-2 align-center">
        <div class="mb-2">{{ item.name }}</div>
        <div class="text-center">
          <v-progress-circular :model-value="item.value" :size="150" :width="15" color="info"
            >{{ item.value !== "NaN" ? item.value + "%" : "N/A" }}
          </v-progress-circular>
        </div>
      </div>
    </v-row>

    <v-row justify="center">
      <v-progress-circular v-if="loading" indeterminate color="primary" :size="50" class="mt-10 mb-10" />

      <v-btn
        rounded="md"
        variant="flat"
        color="primary"
        v-if="isNodeReadyToVisit()"
        class="mt-15"
        @click="getNodeHealthUrl"
      >
        Check Node Health
      </v-btn>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import { getNodeStatusColor } from "@/explorer/utils/helpers";
import type { ResourceWrapper } from "@/explorer/utils/types";
import { GrafanaStatistics } from "@/utils/get_metrics_url";

export default {
  props: {
    node: {
      type: Object as PropType<GridNode>,
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

    // Return true if the node is up or standby
    const isNodeReadyToVisit = () => {
      return (
        (!loading.value && props.node.status === NodeStatus.Up) ||
        (!loading.value && props.node.status === NodeStatus.Standby)
      );
    };

    return {
      NodeStatus,
      resources,
      loading,

      getNodeResources,
      getNodeHealthUrl,
      isNodeReadyToVisit,
      getNodeStatusColor,
    };
  },
};
</script>
