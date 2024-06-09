<template>
  <div class="node-resources mt-10">
    <v-row justify="center">
      <v-col cols="8">
        <h2 class="node-resources-title text-center text-h5 flex justify-center items-center">
          <v-icon size="32" class="mr-2">mdi-chart-pie</v-icon>
          Node {{ node.nodeId }} Resources

          <v-chip v-if="isLiveStats" :color="getNodeStatusColor(node.status).color">
            {{ node.status === NodeStatus.Up ? "Online" : node.status === NodeStatus.Standby ? "Standby" : "Offline" }}
          </v-chip>
          <!-- As isLiveStats=False means we can't reach the node to get the stats from it live. -->
          <v-chip v-else :color="getNodeStatusColor(NodeStatus.Down).color"> Offline </v-chip>
        </h2>
      </v-col>
    </v-row>

    <NodeResources :node="node" />

    <v-row justify="center">
      <div class="d-flex my-6 align-center justify-center">
        <v-progress-circular v-if="loading" indeterminate class="mt-10 mb-10" />
      </div>
      <v-btn rounded="md" variant="flat" class="mt-10" @click="getNodeHealthUrl"> Check Node Health </v-btn>
    </v-row>
    <v-row justify="center" class="w-50 mt-10" style="margin: 0 auto">
      <v-alert variant="tonal" type="warning" v-if="hintMessage">{{ hintMessage }}</v-alert>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref } from "vue";

import type { ResourceWrapper } from "@/types";
import { GrafanaStatistics } from "@/utils/get_metrics_url";
import { getNodeStatusColor } from "@/utils/get_nodes";

import NodeResources from "./node_resources.vue";

export default {
  components: { NodeResources },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
    isLiveStats: {
      type: Boolean,
      required: true,
    },
    hintMessage: {
      type: Object as PropType<string | undefined>,
      required: true,
    },
  },
  setup(props) {
    const resources = ref<ResourceWrapper[]>([]);
    const loading = ref<boolean>(false);
    const indeterminate = ref<boolean>(false);
    const getNodeHealthUrl = async () => {
      const grafana = new GrafanaStatistics(props.node);
      const nodeHealthUrl = await grafana.getUrl();
      window.open(nodeHealthUrl, "_blank");
    };

    return {
      NodeStatus,
      resources,
      loading,
      indeterminate,
      getNodeHealthUrl,
      getNodeStatusColor,
    };
  },
};
</script>
