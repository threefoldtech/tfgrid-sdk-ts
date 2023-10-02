<template>
  <card-details :loading="loading" title="Public Configs Details" :items="twinItems" icon="mdi-cog" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

import CardDetails from "./card_details.vue";

export default {
  name: "PublicConfigDetailsCard",
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
        { name: "IPv4", value: props.node.publicConfig.ipv4 },
        {
          name: "IPv6",
          value: props.node.publicConfig.ipv6,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the IPv6 to the clipboard.",
        },
        { name: "GW4", value: props.node.publicConfig.gw4 },
        { name: "GW6", value: props.node.publicConfig.gw6 },
        { name: "Domain", value: props.node.publicConfig.domain },
      ];
    };

    return {
      twinItems,
      loading,
    };
  },
};
</script>
