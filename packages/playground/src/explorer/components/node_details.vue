<template>
  <v-dialog
    v-model="dialog"
    @update:modelValue="(val:boolean) => closeDialog(val)"
    :scrim="false"
    transition="dialog-bottom-transition"
    hide-overlay
  >
    <v-toolbar>
      <div class="d-flex justify-center">
        <v-btn icon dark @click="() => $emit('close-dialog', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-toolbar>

    <template v-if="loading">
      <v-card class="d-flex justify-center align-center h-screen">
        <v-progress-circular color="primary" indeterminate :size="128" :width="5" />
        <p class="mt-2">Loading node details...</p>
      </v-card>
    </template>

    <template v-else-if="isError">
      <v-card class="d-flex justify-center align-center h-screen">
        <div class="text-center w-100 pa-3">
          <v-icon variant="tonal" color="error" style="font-size: 50px" icon="mdi-close-circle-outline" />
          <p class="mt-4 mb-4 font-weight-bold text-error">
            {{ errorMessage }}
          </p>
          <v-btn class="mr-4" @click="requestNode" color="primary" text="Try Again" />
          <v-btn @click="(val:boolean) => closeDialog(val)" color="error" variant="outlined" text="Cancel" />
        </div>
      </v-card>
    </template>

    <template v-else>
      <v-card>
        <node-resources-charts :node="node" />
        <v-row class="pa-8 mt-5" justify-md="start" justify-sm="center">
          <v-col cols="12" md="6" sm="8">
            <node-details-card :node="node" />
          </v-col>
          <v-col cols="12" md="6" sm="8">
            <country-details-card :node="node" />
            <location-details-card :node="node" />
          </v-col>
          <v-col cols="12" md="6" sm="8">
            <farm-details-card :node="node" />
          </v-col>
          <v-col cols="12" md="6" sm="8">
            <twin-details-card :node="node" />
          </v-col>
          <v-col cols="12" md="6" sm="8">
            <interfaces-details-card :node="node" />
          </v-col>
          <v-col v-if="node.cards?.length" cols="12" md="6" sm="8">
            <gpu-details-card :node="node" />
          </v-col>
          <v-col v-if="node.publicConfig && node.publicConfig.domain" cols="12" md="6" sm="8">
            <public-config-details-card :node="node" />
          </v-col>
        </v-row>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { type PropType, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { getNodeStatusColor } from "@/explorer/utils/helpers";
import router from "@/router";

import { getNode } from "../utils/helpers";
import { type GridProxyRequestConfig, nodeInitializer } from "../utils/types";
import CountryDetailsCard from "./node_details_cards/country_details_card.vue";
import FarmDetailsCard from "./node_details_cards/farm_details_card.vue";
import GpuDetailsCard from "./node_details_cards/gpu_details_card.vue";
import InterfacesDetailsCard from "./node_details_cards/interfaces_details_card.vue";
import LocationDetailsCard from "./node_details_cards/location_details_card.vue";
import NodeDetailsCard from "./node_details_cards/node_details_card.vue";
import PublicConfigDetailsCard from "./node_details_cards/public_config_details_card.vue";
import TwinDetailsCard from "./node_details_cards/twin_details_card.vue";
import NodeResourcesCharts from "./node_resources_charts.vue";

export default {
  props: {
    openDialog: {
      type: Boolean,
      required: true,
    },
    nodeId: {
      type: Number,
      required: true,
    },
    options: {
      type: Object as PropType<GridProxyRequestConfig>,
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
    GpuDetailsCard,
    PublicConfigDetailsCard,
  },

  setup(props, { emit }) {
    const loading = ref(false);
    const dialog = ref(false);
    const isError = ref(false);
    const errorMessage = ref("");
    const route = useRoute();
    const node = ref<GridNode>(nodeInitializer);

    function closeDialog(newValue: boolean) {
      isError.value = false;
      errorMessage.value = "";
      emit("close-dialog", newValue);
    }

    async function requestNode() {
      isError.value = false;
      if (props.nodeId > 0) {
        try {
          loading.value = true;
          const _node: GridNode = await getNode(props.nodeId, props.options);
          node.value = _node;
          router.push({ path: route.path, query: { nodeId: node.value.nodeId } });
        } catch (err) {
          isError.value = true;
          errorMessage.value = `Failed to load node with ID ${props.nodeId}. The node might be offline or unresponsive. You can try requesting it again.`;
        } finally {
          loading.value = false;
        }
      }
    }

    watch(() => props.nodeId, requestNode);

    watch(
      () => props.openDialog,
      newValue => {
        dialog.value = newValue as boolean;
      },
    );

    return {
      NodeStatus,

      dialog,
      node,
      loading,
      isError,
      errorMessage,
      requestNode,
      closeDialog,
      getNodeStatusColor,
    };
  },
};
</script>

<style>
.v-list-item__prepend > .v-icon,
.v-list-item__append > .v-icon {
  opacity: 1 !important;
}
.v-toolbar__content {
  justify-content: end !important;
}
.v-toolbar__content {
  height: 48px !important;
}
</style>
