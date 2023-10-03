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
          <v-list-item>
            <div class="d-inline">
              <v-icon size="30" class="mr-2">mdi-harddisk</v-icon>
              <v-list-item-title style="font-size: 20px; display: inline">Node Resources</v-list-item-title>
            </div>
          </v-list-item>

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
          <v-list-item>
            <div class="d-inline">
              <v-icon size="30" class="mr-2">mdi-map-marker</v-icon>
              <v-list-item-title style="font-size: 20px; display: inline">Location</v-list-item-title>
            </div>
          </v-list-item>

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
          <v-list-item>
            <div class="d-inline">
              <v-icon size="30" class="mr-2">mdi-silo</v-icon>
              <v-list-item-title style="font-size: 20px; display: inline">Farm details</v-list-item-title>
            </div>
          </v-list-item>

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

      <!-- TODO: Add GPU Items -->

      <v-col v-if="item.value.num_gpu > 0" class="mt-n8" style="min-width: 400px">
        <v-card flat color="transparent" tag="div">
          <!-- Title -->
          <v-list-item>
            <div class="d-inline">
              <v-icon size="30" class="mr-2">mdi-expansion-card-variant</v-icon>
              <v-list-item-title style="font-size: 20px; display: inline"
                >GPU Card{{ item.value.num_gpu > 1 ? "s" : "" }} details</v-list-item-title
              >
            </div>
          </v-list-item>

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
    </v-row>
  </td>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { gridProxyClient } from "../clients";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

const dNodeError = ref(false);
const dNodeLoading = ref(true);
const farmName = ref("");
const publicIps = ref(0);

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
</script>

<style></style>
