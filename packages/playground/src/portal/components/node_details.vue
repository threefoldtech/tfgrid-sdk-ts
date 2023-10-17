<template>
  <td :colspan="columnsLen" v-if="dNodeLoading" style="text-align: center">
    <div class="pa-1">
      <v-progress-circular indeterminate model-value="20" :width="3"></v-progress-circular>
    </div>
  </td>
  <td :colspan="columnsLen" v-else-if="dNodeError" style="text-align: center">
    <div class="pt-4">
      <v-alert variant="tonal" class="d-flex justify-between" dense outlined type="error" style="text-align: center">
        <div style="display: flex; align-items: center">Failed to retrieve Node details.</div>
        <template v-slot:append>
          <v-icon @click="getNodeDetails" style="cursor: pointer">mdi-reload</v-icon>
        </template>
      </v-alert>
    </div>
  </td>

  <td :colspan="columnsLen" v-else>
    <v-row class="ma-2">
      <v-col :cols="getColSize">
        <div class="mt-3">
          <card-details
            :loading="false"
            title="Node Resources"
            icon="mdi-harddisk"
            :items="getNodeResourceCard()"
          ></card-details>
        </div>
      </v-col>

      <v-col :cols="getColSize">
        <div class="mt-3">
          <card-details
            :loading="false"
            title="Location"
            icon="mdi-map-marker"
            :items="getCountryResourceCard()"
          ></card-details>
        </div>
      </v-col>

      <v-col :cols="getColSize" :class="{ 'mt-n8': getColSize() === 6 }">
        <div class="mt-3">
          <card-details
            :loading="false"
            title="Farm details"
            icon="mdi-silo"
            :items="getFarmResourceCard()"
          ></card-details>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="item.value.num_gpu > 0" cols="getColSize" style="min-width: 600px; min-height: 400px">
        <div class="mt-3">
          <GPUDetailsCard :node="node" />
        </div> </v-col
    ></v-row>
  </td>
</template>

<script setup lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import { getNode } from "@/explorer/utils/helpers";
import type { NodeDetailsCard } from "@/explorer/utils/types";
import { nodeInitializer } from "@/explorer/utils/types";
import toTeraOrGigaOrPeta from "@/utils/toTeraOrGegaOrPeta";

const dNodeError = ref(false);
const dNodeLoading = ref(true);
const farmName = ref("");
const publicIps = ref(0);
const node = ref<GridNode>(nodeInitializer);

const props = defineProps({
  item: {
    required: true,
    type: null,
  },
  columnsLen: {
    required: true,
    type: Number,
  },
});

onMounted(async () => {
  getNodeDetails();
});

async function getNodeDetails() {
  try {
    dNodeLoading.value = true;
    const res = await gridProxyClient.farms.list({ farmId: props.item.value.farmId });
    farmName.value = res.data[0].name;
    publicIps.value = res.data[0].publicIps.length;
    if (Array.isArray(res) && !res.length) throw new Error("Can't resolve farm data");
    if (props.item.value.num_gpu > 0) {
      const _node: GridNode = await getNode(props.item.value.nodeId, {
        loadGpu: true,
      });
      node.value = _node;
    }
    dNodeError.value = false;
  } catch (e) {
    dNodeError.value = true;
    dNodeLoading.value = false;
  }
  dNodeLoading.value = false;
}

const getFarmResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "ID", value: props.item.value.farmId },
    { name: "Name", value: farmName.value },
    { name: "Certification type", value: props.item.value.certificationType },
    { name: "Public ips", value: publicIps.value },
  ];
};

const getCountryResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "Country", value: props.item.value.location.country },
    { name: "City", value: props.item.value.location.city },
    { name: "Latitude", value: props.item.value.location.latitude },
    { name: "Longitude", value: props.item.value.location.longitude },
  ];
};

const getNodeResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "CPU", value: props.item.value.total_resources.cru + " CPU" },
    { name: "Memory", value: toTeraOrGigaOrPeta(props.item.value.total_resources.mru) },
    { name: "Disk(SSD)", value: toTeraOrGigaOrPeta(props.item.value.total_resources.sru) },
    { name: "Disk(HDD)", value: toTeraOrGigaOrPeta(props.item.value.total_resources.hru) },
  ];
};

function getColSize() {
  if (props.item.num_gpu > 0) {
    return 6;
  } else {
    return 4;
  }
}
</script>

<script lang="ts">
import CardDetails from "@/explorer/components/node_details_cards/card_details.vue";
import GPUDetailsCard from "@/explorer/components/node_details_cards/gpu_details_card.vue";

export default {
  name: "Node Details",
  components: {
    CardDetails,
    GPUDetailsCard,
  },
};
</script>
