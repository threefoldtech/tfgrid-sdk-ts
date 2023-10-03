<template>
  <card-details :loading="loading" title="Node Details" :items="nodeFields" icon="mdi-resistor-nodes" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";
import toHumanDate from "@/utils/date";
import formatResourceSize from "@/utils/format_resource_size";

import CardDetails from "./card_details.vue";

export default {
  name: "NodeDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const nodeFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      nodeFields.value = getNodeDetailsCard();
      loading.value = false;
    };

    onMounted(mount);

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
        {
          name: "Number of Workloads",
          value: props.node.stats && props.node.stats.system ? props.node.stats.users.workloads.toString() : "N/A",
        },
        {
          name: "Number of Deployments",
          value: props.node.stats && props.node.stats.system ? props.node.stats.users.deployments.toString() : "N/A",
        },
      ];
    };

    return {
      nodeFields,
      loading,
    };
  },
};
</script>
