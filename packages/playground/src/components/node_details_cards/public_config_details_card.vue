<template>
  <card-details :loading="loading" title="Public Configs Details" :items="publicConfigFields" icon="mdi-cog" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

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
    const publicConfigFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      publicConfigFields.value = getNodeTwinDetailsCard();
      loading.value = false;
    };

    onMounted(mount);

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      return [
        {
          name: "IPv4",
          value: props.node.publicConfig.ipv4,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the IPv4 to the clipboard.",
        },
        {
          name: "IPv6",
          value: props.node.publicConfig.ipv6,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the IPv6 to the clipboard.",
        },
        {
          name: "GW4",
          value: props.node.publicConfig.gw4,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the GW4 to the clipboard.",
        },
        {
          name: "GW6",
          value: props.node.publicConfig.gw6,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the GW6 to the clipboard.",
        },
        {
          name: "Domain",
          value: props.node.publicConfig.domain,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the Domain to the clipboard.",
        },
      ];
    };

    return {
      publicConfigFields,
      loading,
    };
  },
};
</script>
