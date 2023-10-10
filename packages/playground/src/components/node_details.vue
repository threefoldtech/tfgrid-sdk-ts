<template>
  <td :colspan="columnsLen" v-if="dNodeLoading" style="text-align: center">
    <div class="pa-1">
      <v-progress-circular indeterminate model-value="20" :width="3"></v-progress-circular>
    </div>
  </td>
  <td :colspan="columnsLen" v-else-if="dNodeError" style="text-align: center">
    <strong style="color: #f44336">Failed to retrieve Node details</strong>
  </td>

  <td :colspan="columnsLen" v-else>
    <v-row class="ma-2">
      <v-col :cols="getColSize">
        <v-card flat color="transparent" tag="div">
          <!-- Title -->
          <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
            <v-icon size="30" class="pr-3">mdi-harddisk</v-icon>
            <v-card-title class="pa-0" color="white">Node Resources</v-card-title>
          </v-card>

          <!-- Details -->
          <v-list>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>CPU</v-list-item-title>
                {{ item.value.total_resources.cru }} CPU
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Disk (HDD)</v-list-item-title>
                {{ toTeraOrGigaOrPeta(item.value.total_resources.hru) }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Disk (SSD)</v-list-item-title>
                {{ toTeraOrGigaOrPeta(item.value.total_resources.sru) }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Memory</v-list-item-title>
                {{ toTeraOrGigaOrPeta(item.value.total_resources.mru) }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col :cols="getColSize">
        <v-card flat color="transparent" tag="div">
          <!-- Title -->
          <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
            <v-icon size="30" class="pr-3">mdi-map-marker</v-icon>
            <v-card-title class="pa-0" color="white">Location</v-card-title>
          </v-card>

          <!-- Details -->
          <v-list>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Country</v-list-item-title>
                {{ item.value.location.country }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>City</v-list-item-title>
                {{ item.value.location.city }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Longitude</v-list-item-title>
                {{ item.value.location.longitude }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Latitude</v-list-item-title>
                {{ item.value.location.latitude }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col :cols="getColSize" :class="{ 'mt-n8': getColSize() === 6 }">
        <v-card flat color="transparent" tag="div">
          <!-- Title -->
          <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
            <v-icon size="30" class="pr-3">mdi-silo</v-icon>
            <v-card-title class="pa-0" color="white">Farm details</v-card-title>
          </v-card>

          <!-- Details -->
          <v-list>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>ID</v-list-item-title>
                {{ item.value.farmId }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Name</v-list-item-title>
                {{ farmName }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Certification type</v-list-item-title>
                {{ item.value.certificationType }}
              </v-list-item-content>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item>
              <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                <v-list-item-title>Public Ips</v-list-item-title>
                {{ publicIps }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col v-if="item.value.num_gpu > 0" cols="getColSize" style="min-width: 600px">
        <v-card flat color="transparent" tag="div">
          <!-- Title -->
          <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
            <v-icon size="30" class="pr-3">mdi-expansion-card-variant</v-icon>
            <v-card-title class="pa-0" color="white"
              >GPU Card{{ item.value.num_gpu > 1 ? "s" : "" }} details</v-card-title
            >
          </v-card>

          <!-- Details -->
          <v-row v-if="loading">
            <v-col cols="12" class="text-center pt-12">
              <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
            </v-col>
          </v-row>
          <v-row v-else-if="gpuItem && gpuItem.length !== 0">
            <v-col cols="12">
              <v-list>
                <v-list-item>
                  <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                    <v-tooltip top nudge-bottom="30">
                      <template v-slot:activator="{ isActive, props }">
                        <v-list-item-title v-bind="props" v-on="isActive"
                          >Card ID
                          <v-chip
                            lose-icon="mdi-delete"
                            :color="gpuItem[0].contract ? 'warning' : 'success'"
                            x-small
                            class="mb-1 ml-3"
                            >{{ gpuItem[0].contract ? "Reserved" : "Available" }}</v-chip
                          >
                        </v-list-item-title>
                      </template>
                      <span>Card id that's used in a deployment</span>
                    </v-tooltip>
                    <v-col class="pa-0 d-flex justify-end align-center pl-2">
                      <v-select
                        style="max-width: 250px"
                        v-if="gpuItem.length > 1"
                        append-outer-icon="mdi-content-copy"
                        hide-details
                        dense
                        v-model="gpuItem[0].id"
                        :items="gpuItem"
                        @input.native="gpuItem = $event.srcElement.value.value"
                        @click:append-outer="copy(gpuItem[0].id)"
                      />
                      <v-text-field
                        v-else
                        :value="gpuItem[0].id"
                        readonly
                        hide-details
                        class="mt-n2"
                        dense
                        solo
                        style="max-width: 250px"
                      />
                      <v-icon @click="copy(gpuItem[0].id)">mdi-content-copy</v-icon>
                    </v-col>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                    <v-list-item-title>Vendor</v-list-item-title>
                    {{ gpuItem[0].vendor }}
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item>
                  <v-list-item-content style="display: flex; justify-content: space-between; align-items: center">
                    <v-list-item-title>Device</v-list-item-title>
                    {{ gpuItem[0].device }}
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-list-item class="mb-0" v-if="gpuItem[0].contract !== undefined">
                  <v-tooltip top nudge-bottom="30">
                    <template v-slot:activator="{ isActive, props }">
                      <v-list-item-content
                        v-bind="props"
                        v-on="isActive"
                        style="display: flex; justify-content: space-between; align-items: center"
                      >
                        <v-list-item-title> Contract ID</v-list-item-title>
                        {{ gpuItem[0].contract }}
                      </v-list-item-content>
                    </template>
                    <span>The contract id that reserves this GPU card</span>
                  </v-tooltip>
                </v-list-item>
                <v-divider></v-divider>
              </v-list>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </td>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { gridProxyClient } from "../clients";
import { useProfileManager } from "../stores";
import { createCustomToast, ToastType } from "../utils/custom_toast";
import { getGrid } from "../utils/grid";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

const profileManager = useProfileManager();
const dNodeError = ref(false);
const dNodeLoading = ref(true);
const farmName = ref("");
const publicIps = ref(0);
const loading = ref(false);
const gpuItem = ref<any[]>();

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
  try {
    const res = await gridProxyClient.farms.list({ farmId: props.item.value.farmId });
    farmName.value = res.data[0].name;
    publicIps.value = res.data[0].publicIps.length;
    if (Array.isArray(res) && !res.length) throw new Error("Can't resolve farm data");
    if (props.item.value.num_gpu > 0) loadGPUitems();
  } catch (e) {
    dNodeError.value = true;
  }
  dNodeLoading.value = false;
});

function getColSize() {
  if (props.item.num_gpu > 0) {
    return 6;
  } else {
    return 4;
  }
}

async function loadGPUitems() {
  loading.value = true;
  try {
    const grid = await getGrid(profileManager.profile!);
    gpuItem.value = await grid?.zos.getNodeGPUInfo({ nodeId: props.item.value.nodeId });
    loading.value = false;
  } catch (e) {
    console.log("Error: ", e);
    createCustomToast("Failed to load GPU details", ToastType.danger);
  }
}

function copy(id: string) {
  navigator.clipboard.writeText(id);
  createCustomToast("GPU ID copied to clipboard", ToastType.success);
}
</script>

<style></style>
