<template>
  <card-details
    :loading="loading"
    title="Interfaces Details"
    :items="interfaceFields"
    icon="mdi-expansion-card-variant"
  />
</template>

<script lang="ts">
import type { Interfaces } from "@threefold/graphql_client";
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import { gqlClient } from "@/clients";
import type { NodeDetailsCard } from "@/explorer/utils/types";
import { createCustomToast, ToastType } from "@/utils/custom_toast";

import CardDetails from "./card_details.vue";

export default {
  name: "InterfacesDetailsCard",
  components: { CardDetails },
  props: {
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
  },

  setup(props) {
    const loading = ref<boolean>(false);
    const interfaceFields = ref<NodeDetailsCard[]>();
    const interfacesDetails = ref<Interfaces>();

    const mount = () => {
      loading.value = true;
      interfaceFields.value = getNodeDetailsCard();
      loading.value = false;
    };

    onMounted(async () => {
      await getInterfaces();
      mount();
    });

    const getInterfaces = async () => {
      if (props.node) {
        const interfaces = await gqlClient.interfaces(
          { name: true, ips: true, mac: true },
          { where: { node: { nodeID_eq: props.node?.nodeId } } },
        );
        interfacesDetails.value = interfaces[0] as Interfaces;
      }
    };

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    const getNodeDetailsCard = (): NodeDetailsCard[] => {
      return [
        { name: "Name", value: interfacesDetails.value?.name },
        { name: "Mac Address", value: interfacesDetails.value?.mac },
        {
          name: "IPs",
          value: interfacesDetails.value?.ips.replace(",", "  |  "),
          icon: "mdi-content-copy",
          callback: copy,
          hint: "Copy the interface ips to the clipboard.",
        },
      ];
    };

    return {
      interfaceFields,
      loading,
    };
  },
};
</script>
