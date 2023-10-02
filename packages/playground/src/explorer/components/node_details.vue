<template>
  <v-dialog
    v-model="dialog"
    @update:modelValue="(val:boolean) => $emit('close-dialog', val)"
    :scrim="false"
    transition="dialog-bottom-transition"
    hide-overlay
  >
    <v-card>
      <v-card-title>
        <v-btn icon dark @click="() => $emit('close-dialog', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <div v-if="loading" class="d-flex justify-center" style="height: 100%">
        <div class="align-self-center d-flex flex-column align-center">
          <v-progress-circular indeterminate color="primary" :size="100" />
          <p class="pt-4 text-center">Loading Node {{ node.nodeId }} details</p>
        </div>
      </div>

      <template v-else>
        <node-resources-charts :node="node" :grid-proxy-client="gridProxyClient" />

        <v-row class="pa-8 mt-5">
          <v-col cols="4">
            <node-details-card :node="node" />
          </v-col>
          <v-col cols="4">
            <farm-details-card :node="node" />
            <country-details-card class="mt-5" :node="node" />
          </v-col>
          <v-col cols="4">
            <interfaces-details-card :node="node" />
            <location-details-card class="mt-5" :node="node" />
          </v-col>
          <v-col cols="4">
            <twin-details-card :node="node" />
          </v-col>
        </v-row>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// import the styling for the toast
// import "mosha-vue-toastify/dist/style.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { GridNode, NodeStats } from "@threefold/gridproxy_client";
import type GridProxyClient from "@threefold/gridproxy_client";
// import { byCountry } from "country-code-lookup";
// import { createToast } from "mosha-vue-toastify";
import { type PropType, ref, watch } from "vue";

import CountryDetailsCard from "./node_details_cards/country_details_card.vue";
import FarmDetailsCard from "./node_details_cards/farm_details_card.vue";
import InterfacesDetailsCard from "./node_details_cards/interfaces_details_card.vue";
import LocationDetailsCard from "./node_details_cards/location_details_card.vue";
import NodeDetailsCard from "./node_details_cards/node_details_card.vue";
import TwinDetailsCard from "./node_details_cards/twin_details_card.vue";
// import { gqlClient, gridProxyClient } from "@/clients";
// import toHumanDate from "@/utils/date";
// import formatResourceSize from "@/utils/format_resource_size";
import NodeResourcesCharts from "./node_resources_charts.vue";

export default {
  props: {
    openDialog: {
      type: Boolean,
      required: true,
    },
    node: {
      type: Object as PropType<GridNode>,
      required: true,
    },
    gridProxyClient: {
      type: Object as PropType<GridProxyClient>,
      required: true,
    },
  },
  components: {
    NodeResourcesCharts,
    NodeDetailsCard,
    FarmDetailsCard,
    CountryDetailsCard,
    LocationDetailsCard,
    InterfacesDetailsCard,
    TwinDetailsCard,
  },

  setup(props) {
    const dialog = ref(false);
    const loading = ref(true);
    const farmDetails = ref(null);
    const twinDetails = ref(null);
    const nodesMap = ref(null);
    const interfacesDetails = ref(null);

    // const getFarmDetails = async () => {
    //   if (props.node) {
    //     const { data } = await gridProxyClient.farms.list({ farmId: props.node?.farmId });
    //     // const res = await gqlClient.console.log(res);
    //     farmDetails.value = data[0] as any;
    //   }
    // };

    // const getTwinDetails = async () => {
    //   if (props.node) {
    //     const { data } = await gridProxyClient.twins.list({ twinId: props.node?.twinId });
    //     twinDetails.value = data[0] as any;
    //   }
    // };

    // const getStats = async () => {
    //   if (props.node) {
    //     const { nodesDistribution } = await gridProxyClient.stats.get();
    //     delete nodesDistribution[""];
    //     nodesMap.value = nodesDistribution as any;
    //   }
    // };

    // const getInterfaces = async () => {
    //   if (props.node) {
    //     const interfaces = await gqlClient.interfaces(
    //       { name: true, ips: true, mac: true },
    //       { where: { node: { nodeID_eq: props.node?.nodeId } } },
    //     );

    //     interfacesDetails.value = interfaces[0] as any;
    //   }
    // };

    const loadData = async () => {
      loading.value = true;
      if (props.node) {
        // console.log("resources", resources.value);
        // await getFarmDetails();
        // await getTwinDetails();
        // await getStats();
        // await getInterfaces();
        // getNodeResources();
      }
      loading.value = false;
    };

    // const copy = (address: string) => {
    //   navigator.clipboard.writeText(address);
    //   createToast("Copied!");
    // };

    // const countryFlagSrc = () => {
    //   const conuntryCode =
    //     props.node?.country && props.node?.country?.length > 2
    //       ? byCountry(props.node?.country)?.internet
    //       : props.node?.country;

    //   return conuntryCode?.toLocaleLowerCase() != "ch"
    //     ? `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.jpg`
    //     : `https://www.worldatlas.com/r/w425/img/flag/${conuntryCode?.toLocaleLowerCase()}-flag.png`;
    // };

    // const getCountryCode = () => {
    //   return props.node?.country && props.node?.country?.length > 2
    //     ? byCountry(props.node?.country)?.internet
    //     : props.node?.country;
    // };
    watch(
      () => props.openDialog,
      newValue => {
        if (!newValue) {
          // resources.value = [];
        }
        dialog.value = newValue as boolean;
        if (newValue) {
          loadData();
        }
      },
    );
    return {
      dialog,
      loading,
      farmDetails,
      twinDetails,
      nodesMap,
      interfacesDetails,
      // toFixedCsSize,
      // copy,
      // toHumanDate,
      // countryFlagSrc,
      // getCountryCode,
    };
  },
};
</script>

<style scoped>
.v-list-item__prepend > .v-icon,
.v-list-item__append > .v-icon {
  opacity: 1 !important;
}
</style>
