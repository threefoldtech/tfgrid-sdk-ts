<template>
  <card-details :loading="loading" title="Interfaces Details" :items="farmItems" icon="mdi-expansion-card-variant" />
</template>

<script lang="ts">
import gqlClient, { type Interfaces } from "@threefold/graphql_client";
import type { GridNode } from "@threefold/gridproxy_client";
import { createToast } from "mosha-vue-toastify";
import { onMounted, type PropType, ref } from "vue";

import type { NodeDetailsCard } from "@/explorer/utils/types";

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
    const farmItems = ref<NodeDetailsCard[]>();
    const interfacesDetails = ref<Interfaces>();

    const mount = () => {
      loading.value = true;
      farmItems.value = getNodeDetailsCard();
      loading.value = false;
    };

    onMounted(async () => {
      await getInterfaces();
      mount();
    });

    const getInterfaces = async () => {
      if (props.node) {
        const network = process.env.NETWORK || (window as any).env.NETWORK;
        const client = new gqlClient(network);
        const interfaces = await client.interfaces(
          { name: true, ips: true, mac: true },
          { where: { node: { nodeID_eq: props.node?.nodeId } } },
        );

        interfacesDetails.value = interfaces[0] as any;
      }
    };

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createToast("Copied!", {
        position: "top-right",
        hideProgressBar: true,
        toastBackgroundColor: "#1aa18f",
        timeout: 5000,
      });
    };

    const getNodeDetailsCard = (): NodeDetailsCard[] => {
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
      farmItems,
      loading,
    };
  },
};
</script>
