<template>
  <card-details :loading="loading" title="GPU Details" :items="twinItems" icon="mdi-credit-card-settings-outline" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

import CardDetails from "./card_details.vue";

export default {
  name: "TwinDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const twinItems = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      twinItems.value = getNodeTwinDetailsCard();
      loading.value = false;
    };

    onMounted(async () => {
      mount();
    });

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createToast("Copied!", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "#1aa18f",
        timeout: 5000,
      });
    };

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      return [
        { name: "Card ID", value: props.node.twin.twinId.toString() },
        {
          name: "Account ID",
          value: props.node.twin.accountId,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the account id to the clipboard.",
        },
        { name: "Relay", value: props.node.twin.relay },
      ];
    };

    return {
      twinItems,
      loading,
    };
  },
};
</script>
