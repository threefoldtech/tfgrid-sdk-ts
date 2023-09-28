<template>
  <v-card :loading="loading" color="#1b1a1a">
    <v-alert class="pa-5" style="height: 20px" color="info">
      <h4 class="text-center">
        <v-icon color="black" icon="mdi-resistor-nodes" />
        Node Detials
      </h4>
    </v-alert>
    <v-card-item v-if="!loading" class="mt-2 mb-2">
      <v-row class="bb-gray" v-for="item in nodeDetailFields" :key="item.name">
        <v-col class="d-flex justify-start">{{ item.name }}</v-col>
        <v-col class="d-flex justify-end">{{ item.value }}</v-col>
      </v-row>
    </v-card-item>
  </v-card>
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import { onMounted, ref, watch } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";
import toHumanDate from "@/utils/date";
import formatResourceSize from "@/utils/format_resource_size";

export default {
  name: "NodeDetailsCard",
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const nodeDetailFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      nodeDetailFields.value = getNodeDetailsCard();
      loading.value = false;
    };

    onMounted(async () => {
      mount();
    });

    watch(props.node, () => {
      mount();
    });

    const getNodeDetailsCard = (): NodeDetailsCard[] => {
      return [
        { name: "ID", value: props.node.nodeId.toString() },
        { name: "Farm ID", value: props.node.farmId.toString() },
        { name: "Farm Policy ID", value: props.node.farmingPolicyId.toString() },
        { name: "CPU", value: `${props.node.total_resources.cru} cores` },
        { name: "Disk(HDD)", value: formatResourceSize(props.node.total_resources.hru) },
        { name: "Disk(SSD)", value: formatResourceSize(props.node.total_resources.sru) },
        { name: "RAM", value: formatResourceSize(props.node.total_resources.mru) },
        { name: "Created", value: toHumanDate(props.node.created) },
        { name: "Certification Type", value: props.node.certificationType },
        { name: "Number of Workloads", value: props.node.stats.users.workloads.toString() },
        { name: "Number of Deployments", value: props.node.stats.users.deployments.toString() },
      ];
    };

    return {
      nodeDetailFields,
      loading,
    };
  },
};
</script>

<style scoped>
.bb-gray {
  border-bottom: 1px solid gray;
}
</style>
