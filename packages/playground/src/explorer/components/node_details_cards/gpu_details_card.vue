<template>
  <card-details :loading="loading" title="GPU Details" :items="gpuFields" icon="mdi-credit-card-settings-outline" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

import CardDetails from "./card_details.vue";

export default {
  name: "GPUDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const gpuFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      gpuFields.value = getNodeTwinDetailsCard();
      loading.value = false;
    };

    onMounted(async () => {
      mount();
    });

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      return [
        {
          name: "Card ID",
          value: props.node.cards[0].id,
          nameHint: props.node.cards[0].contract ? "Reserved" : "Available",
          nameHintColor: props.node.cards[0].contract ? "warning" : "primary",
        },
        {
          name: "Vendor",
          value: props.node.cards[0].vendor,
          hint: props.node.cards[0].vendor,
        },
        {
          name: "Device",
          value: props.node.cards[0].device,
          hint: props.node.cards[0].device,
        },
        {
          name: "Contract ID",
          value: props.node.cards[0].contract === 0 ? "N/A" : props.node.cards[0].contract.toString(),
        },
      ];
    };

    return {
      gpuFields,
      loading,
    };
  },
};
</script>
