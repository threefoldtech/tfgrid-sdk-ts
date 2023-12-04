<template>
  <card-details :loading="loading" title="Farm Details" :items="farmFields" icon="mdi-webpack" />
</template>

<script lang="ts">
import type { Farm, GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import CardDetails from "./card_details.vue";

export default {
  name: "FarmDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: false,
    },
    farm: {
      type: Object as PropType<Farm>,
      required: false,
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
      let farmId, farmName, farmStellarAddress;
      if (props.node) {
        farmId = props.node.farmId.toString();
        farmName = props.node.farm.name;
        farmStellarAddress = props.node.farm.stellarAddress.length ? props.node.farm.stellarAddress : "-";
      } else if (props.farm) {
        farmId = props.farm.farmId.toString();
        farmName = props.farm.name;
        farmStellarAddress = props.farm.stellarAddress.length ? props.farm.stellarAddress : "-";
      }
      return [
        { name: "ID", value: farmId },
        { name: "Name", value: farmName },
        {
          name: "Stellar Address",
          value: farmStellarAddress,
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
