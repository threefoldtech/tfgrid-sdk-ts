<template>
  <card-details :loading="loading" title="Node Twin Details" :items="twinFields" icon="mdi-account" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

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
    const twinFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      twinFields.value = getNodeTwinDetailsCard();
      loading.value = false;
    };

    onMounted(mount);

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      return [
        { name: "ID", value: props.node.twin.twinId.toString() },
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
      twinFields,
      loading,
    };
  },
};
</script>
