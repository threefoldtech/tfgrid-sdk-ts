<template>
  <card-details :loading="loading" title="Farm Details" :items="farmFields" icon="mdi-webpack" />
</template>

<script lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import CardDetails from "./card_details.vue";

export default {
  name: "FarmDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const farmFields = ref<NodeDetailsCard[]>();

    const mount = () => {
      loading.value = true;
      farmFields.value = getFarmDetails();
      loading.value = false;
    };

    onMounted(mount);

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    const getFarmDetails = (): NodeDetailsCard[] => {
      return [
        { name: "ID", value: props.node.farmId.toString() },
        { name: "Name", value: props.node.farm.name },
        {
          name: "Stellar Address",
          value: props.node.farm.stellarAddress,
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the stellar address to the clipboard.",
        },
      ];
    };

    return {
      farmFields,
      loading,
    };
  },
};
</script>
