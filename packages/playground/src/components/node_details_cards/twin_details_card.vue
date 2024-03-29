<template>
  <card-details :loading="loading" title="Twin Details" :items="twinFields" icon="mdi-account" />
</template>

<script lang="ts">
import type { Farm, GridNode, Twin } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import { getFarmTwinByTwinId } from "@/utils/get_farms";

import CardDetails from "./card_details.vue";

export default {
  name: "TwinDetailsCard",
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
    const twinFields = ref<NodeDetailsCard[]>();
    const twin = ref<Twin>();

    onMounted(async () => {
      loading.value = true;

      if (props.farm) {
        try {
          twin.value = await getFarmTwinByTwinId({ twinId: props.farm.twinId });
        } catch (err) {
          createCustomToast(
            "Failed to load Twin details due to Slow Network. Please try again later.",
            ToastType.danger,
          );
        } finally {
          loading.value = false;
        }
      } else if (props.node) {
        twin.value = props.node.twin;
        loading.value = false;
      }
      twinFields.value = getNodeTwinDetailsCard();
    });

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    const getNodeTwinDetailsCard = (): NodeDetailsCard[] => {
      let twinId, accountId, relay;
      if (twin.value) {
        twinId = twin.value.twinId.toString();

        accountId = twin.value.accountId;
        relay = twin.value.relay;
      }

      return [
        { name: "ID", value: twinId || "-" },
        {
          name: "Account Address",
          value: accountId || "-",
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the account address to the clipboard.",
        },
        { name: "Relay", value: relay || "-" },
      ];
    };

    return {
      twinFields,
      loading,
    };
  },
};
</script>
