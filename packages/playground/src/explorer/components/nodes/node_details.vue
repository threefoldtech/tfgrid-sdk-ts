<template>
  <v-dialog
    v-model="dialog"
    @update:modelValue="(val:boolean) => $emit('close-dialog', val)"
    :scrim="false"
    transition="dialog-bottom-transition"
    fullscreen
    hide-overlay
  >
    <v-card>
      <v-toolbar dark color="primary">
        <v-btn icon dark @click="() => $emit('close-dialog', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Node {{ node.nodeId }}</v-toolbar-title>
      </v-toolbar>

      <div v-if="loading" class="d-flex justify-center" style="height: 100%">
        <div class="align-self-center d-flex flex-column align-center">
          <v-progress-circular indeterminate color="primary" :size="100" />
          <p class="pt-4 text-center">Loading Node {{ node.nodeId }} details</p>
        </div>
      </div>

      <template v-else>
        <div class="node-resources mt-10">
          <v-row justify="center">
            <v-col cols="8">
              <h2 class="node-resources-title text-center text-h4 flex justify-center items-center">
                <v-icon size="40" class="mr-2">mdi-chart-pie</v-icon>
                Node Resources
                <span :style="'color:' + (node.status === nodeStatus.Up ? '#4caf50' : '#f44336')">{{
                  node.status === nodeStatus.Up ? "[Online]" : "Offline"
                }}</span>
              </h2>
            </v-col>
          </v-row>
          <!-- Details -->
          <v-row>
            <v-col cols="12">
              <div class="d-flex justify-center">
                <div v-for="item in resources" :key="item.name" class="mx-6 d-flex flex-column align-center">
                  <div>{{ item.name }}</div>
                  <div class="text-center">
                    <v-progress-circular
                      :model-value="isNaN(+item.value) ? 0 : item.value"
                      :size="150"
                      :width="15"
                      color="primary"
                      v-if="isNaN(+item.value)"
                      >NA
                    </v-progress-circular>
                    <v-progress-circular
                      :model-value="isNaN(+item.value) ? 0 : item.value"
                      :size="150"
                      :width="15"
                      color="primary"
                      v-else
                      >{{ item.value }}%
                    </v-progress-circular>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
// import the styling for the toast
import "mosha-vue-toastify/dist/style.css";

import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { byCountry } from "country-code-lookup";
import { createToast } from "mosha-vue-toastify";
import type { PropType } from "vue";
import { ref, watch } from "vue";

import { gqlClient, gridProxyClient } from "@/clients";
import type { ResourceWrapper } from "@/explorer/utils/types";
import toHumanDate from "@/utils/date";
import toFixedCsSize from "@/utils/to_fixed_cs_size";

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
  },

  setup(props) {
    const dialog = ref(false);
    const loading = ref(true);
    const farmDetails = ref(null);
    const twinDetails = ref(null);
    const nodesMap = ref(null);
    const interfacesDetails = ref(null);
    const resources = ref<ResourceWrapper[]>([]);
    const nodeStatus = NodeStatus;

    const getNodeResources = () => {
      for (const resource in props.node.used_resources) {
        resources.value.push({
          name: resource.toLocaleUpperCase(),
          value: (
            (Reflect.get(props.node.used_resources, resource) / Reflect.get(props.node.total_resources, resource)) *
            100
          ).toFixed(2),
        });
      }
    };

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
        console.log("resources", resources.value);
        // await getFarmDetails();
        // await getTwinDetails();
        // await getStats();
        // await getInterfaces();
        getNodeResources();
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
          resources.value = [];
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
      resources,
      nodeStatus,
      toFixedCsSize,
      // copy,
      toHumanDate,
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
