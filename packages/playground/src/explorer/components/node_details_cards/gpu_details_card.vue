<template>
  <card-details
    :is-list-items="true"
    :loading="loading"
    title="GPUs Details"
    :items="gpuFields"
    icon="mdi-credit-card-settings-outline"
  />
</template>

<script lang="ts">
import type { GPUCard, GridNode } from "@threefold/gridproxy_client";
import { createToast } from "mosha-vue-toastify";
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
    const gpuFields = ref<NodeDetailsCard[]>([]); // Initialize as an empty array

    const mount = () => {
      loading.value = true;
      props.node.cards.map((card: GPUCard, index: number) => {
        index += 1;
        const cardField = getNodeTwinDetailsCard(card, index);
        gpuFields.value.push(...cardField);
      });
      loading.value = false;
    };

    onMounted(mount);

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createToast("Copied!", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "#1aa18f",
        timeout: 5000,
      });
    };

    const getNodeTwinDetailsCard = (card: GPUCard, index: number): NodeDetailsCard[] => {
      console.log("This is working...");
      return [
        {
          name: "Card Level / Number",
          value: `(${index})`,
          icon: "mdi-information-outline",
          callback: () => {},
          hint: "The card level corresponds to the physical card number within the node. For instance, if the node has 2 cards, the first card's level is 1, and the next one, if present, will be 2, and so on.",
        },
        {
          name: `Card ID`,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the Card ID to the clipboard.",
          value: card.id,
          nameHint: card.contract ? "Reserved" : "Available",
          nameHintColor: card.contract ? "warning" : "primary",
        },
        {
          name: "Vendor",
          value: card.vendor,
          hint: card.vendor,
        },
        {
          name: "Device",
          value: card.device,
          hint: card.device,
        },
        {
          name: "Contract ID",
          value: card.contract === 0 ? "N/A" : card.contract.toString(),
        },
        { name: "" },
      ];
    };

    return {
      gpuFields,
      loading,
    };
  },
};
</script>
