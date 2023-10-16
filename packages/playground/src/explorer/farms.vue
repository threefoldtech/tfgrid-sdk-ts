<template>
  <!-- filter -->
  <view-layout>
    <v-row>
      <v-col>
        <!-- table -->
        <FarmsTable :items="farms" :loading="loading" v-model:selectedFarm="selectedFarmId" @open-dialog="openDialog" />
      </v-col>
    </v-row>
    <farmDialog :farm="selectedFarm!" :twin="selectedTwin!" :openDialog="isDialogOpened" @close-dialog="closeDialog" />
  </view-layout>
</template>

<script lang="ts" setup>
import type { CertificationType, PublicIp } from "@threefold/gridproxy_client";
import type { Twin } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import router from "@/router";

import { getFarms, getTwins } from "./utils/helpers";
export interface IFarm {
  farmId: number;
  name: string;
  twinId: number;
  pricingPolicyId: number;
  certificationType: CertificationType;
  publicIps: PublicIp[];
  stellarAddress?: string;
  totalPublicIp: number;
  usedPublicIp: number;
  freePublicIp: number;
}
const route = useRoute();

const loading = ref<boolean>(false);
const farms = ref<IFarm[]>([]);
const twins = ref<Twin[]>([]);
const isDialogOpened = ref<boolean>(false);
const selectedFarmId = ref<number>(0);
const selectedFarm = ref<IFarm>();
const selectedTwin = ref<Twin>();

const getAllFarms = async () => {
  loading.value = true;
  try {
    const farmsInfo = await getFarms();
    farms.value = farmsInfo.map(farm => {
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
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const getAllTwins = async () => {
  loading.value = true;
  try {
    const { data } = await getTwins();
    twins.value = data;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const openDialog = async (item: IFarm) => {
  selectedFarmId.value = item.farmId;
  isDialogOpened.value = true;
  getDetails(selectedFarmId.value, item.twinId);
};

const closeDialog = () => {
  if (route.query.nodeId) {
    router.replace(route.path);
  }
  isDialogOpened.value = false;
  selectedFarmId.value = 0;
};

const getDetails = (farmId: number, twinId: number) => {
  const farm = farms.value.find(farm => farm.farmId === farmId);
  const twin = twins.value.find(twin => twin.twinId === twinId);
  selectedFarm.value = farm;
  selectedTwin.value = twin;
};

onMounted(async () => {
  await getAllFarms();
  await getAllTwins();
});
</script>

<script lang="ts">
import farmDialog from "./components/farm_Dialog.vue";
import FarmsTable from "./components/farms_table.vue";

export default {
  name: "Farms",
  components: {
    FarmsTable,
    farmDialog,
  },
};
</script>
