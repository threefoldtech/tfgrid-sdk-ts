<template>
  <td v-if="dNodeLoading" :colspan="columnsLen" style="text-align: center">
    <div class="pa-1">
      <div class="d-flex my-6 align-center justify-center">
        <v-progress-circular :size="20" />
      </div>
    </div>
  </td>
  <td v-else-if="dNodeError" :colspan="columnsLen" style="text-align: center">
    <div class="pt-4">
      <v-alert variant="tonal" class="d-flex justify-between" dense outlined type="error" style="text-align: center">
        <div style="display: flex; align-items: center">Failed to retrieve Node details.</div>
        <template #append>
          <v-icon style="cursor: pointer" @click="reloadNodeDetails"> mdi-reload </v-icon>
        </template>
      </v-alert>
    </div>
  </td>

  <td v-else :style="{ backgroundColor: 'rgb(var(--v-theme-background))' }" :colspan="columnsLen">
    <v-row class="ma-2">
      <v-col :cols="getColSize">
        <div class="mt-3">
          <card-details :loading="false" title="Node Resources" icon="mdi-harddisk" :items="getNodeResourceCard()" />
        </div>
      </v-col>

      <v-col :cols="getColSize">
        <div class="mt-3">
          <card-details :loading="false" title="Location" icon="mdi-map-marker" :items="getCountryResourceCard()" />
        </div>
      </v-col>

      <v-col :cols="getColSize" class="{ 'mt-n8': getColSize() === 6 }">
        <div class="mt-3">
          <card-details :loading="false" title="Farm details" icon="mdi-silo" :items="getFarmResourceCard()" />
        </div>
      </v-col>
    </v-row>
    <v-row class="d-flex" style="justify-content: center">
      <div v-if="gpuLoading" class="pa-1 pb-4">
        <div style="bottom: 10rem; top: 10rem">
          <p
            :style="{
              paddingBottom: '3rem',
              color: '#7de3c8',
              fontSize: '1.25rem',
            }"
          >
            Loading Node gpu details{{ dots }}
          </p>
        </div>
      </div>
      <v-row v-if="gpuError" style="justify-content: center; align-items: center; margin-bottom: 2rem">
        <div>
          <v-alert
            variant="tonal"
            class="d-flex justify-between"
            color="#f44336"
            dense
            outlined
            type="error"
            style="text-align: center"
          >
            <div style="display: flex; align-items: center">Failed to receive node GPUs information</div>
            <template #append>
              <v-icon style="cursor: pointer" @click="getGpuDetails"> mdi-reload </v-icon>
            </template>
          </v-alert>
        </div>
      </v-row>
      <v-col
        v-if="nodeData.num_gpu > 0"
        cols="getColSize"
        style="max-width: 93rem; min-height: 400px; justify-content: center"
      >
        <div class="mt-3">
          <GPUDetailsCard :node="nodeData" />
        </div>
      </v-col>
    </v-row>
  </td>
</template>

<script setup lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { onMounted, type PropType, ref } from "vue";

import { gridProxyClient } from "@/clients";
import type { NodeDetailsCard } from "@/types";
import { nodeInitializer } from "@/types";
import formatResourceSize from "@/utils/format_resource_size";
import { getNode } from "@/utils/get_nodes";

const dNodeError = ref(false);
const dNodeLoading = ref(true);
const gpuLoading = ref(false);
const gpuError = ref(false);
const farmName = ref("");
const publicIps = ref(0);
const nodeData = ref<GridNode>(nodeInitializer);
const dots = ref(".");
const interval = ref<number | null>(null);

const props = defineProps({
  node: {
    required: true,
    type: Object as PropType<GridNode>,
  },
  columnsLen: {
    required: true,
    type: Number,
  },
});

onMounted(async () => {
  reloadNodeDetails();
});

async function reloadNodeDetails() {
  await getNodeDetails();
  await getGpuDetails();
}

async function getNodeDetails() {
  try {
    dNodeLoading.value = true;
    const res = await gridProxyClient.farms.list({ farmId: props.node.farmId });
    farmName.value = res.data[0].name;
    publicIps.value = res.data[0].publicIps.length;
    if (Array.isArray(res) && !res.length) throw new Error("Can't resolve farm data");
    dNodeLoading.value = true;
    dNodeError.value = false;
  } catch (e) {
    console.log("Error retrieving node details: ", e);
    dNodeError.value = true;
    dNodeLoading.value = false;
  }
  dNodeLoading.value = false;
}

async function getGpuDetails() {
  try {
    if (props.node.num_gpu > 0) {
      gpuLoading.value = true;
      if (interval.value !== null) {
        window.clearInterval(interval.value);
      }
      interval.value = window.setInterval(loadingDots, 500);

      gpuError.value = false;
      const _node: GridNode = await getNode(props.node.nodeId);
      nodeData.value = _node;
    }
    gpuLoading.value = false;
  } catch (e) {
    console.log("Error retrieving gpu node details: ", e);
    gpuLoading.value = false;
    gpuError.value = true;
  }
}

const getFarmResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "ID", value: props.node.farmId.toString() },
    { name: "Name", value: farmName.value },
    { name: "Certification type", value: props.node.certificationType },
    { name: "Public ips", value: publicIps.value.toString() },
  ];
};

const getCountryResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "Country", value: props.node.location.country },
    { name: "City", value: props.node.location.city },
    { name: "Latitude", value: props.node.location.latitude.toString() },
    { name: "Longitude", value: props.node.location.longitude.toString() },
  ];
};

const getNodeResourceCard = (): NodeDetailsCard[] => {
  return [
    { name: "CPU", value: props.node.total_resources.cru.toString() + " CPU" },
    { name: "Memory", value: formatResourceSize(props.node.total_resources.mru) },
    { name: "Disk(SSD)", value: formatResourceSize(props.node.total_resources.sru) },
    { name: "Disk(HDD)", value: formatResourceSize(props.node.total_resources.hru) },
  ];
};

function getColSize() {
  if (props.node.num_gpu > 0) {
    return 6;
  } else {
    return 4;
  }
}

function loadingDots() {
  if (dots.value === "...") {
    dots.value = ".";
  } else {
    dots.value += ".";
  }
}
</script>

<script lang="ts">
import CardDetails from "@/components/node_details_cards/card_details.vue";
import GPUDetailsCard from "@/components/node_details_cards/gpu_details_card.vue";

export default {
   
  name: "NodeDetails",
  components: {
    CardDetails,
    GPUDetailsCard,
  },
};
</script>
