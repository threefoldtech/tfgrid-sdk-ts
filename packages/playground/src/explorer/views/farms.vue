<template>
  <view-layout>
    <v-row>
      <v-col>
        <FarmsTable :items="farms" :loading="loading" :selectedFarm="selectedFarm" @open-dialog="openDialog" />
      </v-col>
    </v-row>
    <farmDialog v-if="selectedFarm" :openDialog="isDialogOpened" :farm="selectedFarm" @close-dialog="closeDialog" />
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import router from "../../router";
import { getFarms } from "../utils/helpers";

const route = useRoute();

const loading = ref<boolean>(false);
const farms = ref<Farm[]>();
const isDialogOpened = ref<boolean>(false);
const selectedFarm = ref<Farm>();

onMounted(async () => {
  await checkPath();
  loading.value = true;
  const { count, data } = await getFarms();
  if (data) {
    farms.value = data.map(farm => {
      const ips = farm.publicIps;
      const total = ips.length;
      const used = ips.filter(x => x.contract_id === 0).length;
      return {
        ...farm,
        totalPublicIp: total,
        usedPublicIp: used,
        freePublicIp: total - used,
      };
    });
  }
  loading.value = false;
});

const checkPath = async () => {
  if (route.query.twinId) {
    router.replace(route.path);
  }
};

const openDialog = (item: Farm) => {
  selectedFarm.value = item;
  isDialogOpened.value = true;
};

const closeDialog = () => {
  if (route.query.twinId) {
    router.replace(route.path);
  }
  isDialogOpened.value = false;
};
</script>

<script lang="ts">
import FarmDialog from "../components/farm_dialog.vue";
import FarmsTable from "../components/farms_table.vue";

export default {
  name: "Farms",
  components: {
    FarmsTable,
    FarmDialog,
  },
};
</script>
