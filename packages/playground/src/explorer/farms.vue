<template>
  <!-- filter -->
  <view-layout>
    <v-row>
      <v-col>
        <!-- table -->
        <FarmsTable :items="farms" :loading="loading" />
      </v-col>
    </v-row>
    <!-- details -->
  </view-layout>
</template>

<script lang="ts" setup>
import type { CertificationType, PublicIp } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";

import { getFarms } from "./utils/helpers";

interface IFarm {
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

const loading = ref<boolean>(false);
const farms = ref<IFarm[]>([]);

const getAllFarms = async () => {
  loading.value = true;
  try {
    const data = await getFarms();
    farms.value = data.map(farm => {
      const ips = farm.publicIps;
      const total = ips.length;
      const used = ips.filter(x => x.contractId === 0).length;
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
onMounted(async () => {
  await getAllFarms();
});
</script>

<script lang="ts">
import FarmsTable from "./components/farms_table.vue";
export default {
  name: "Farms",
  components: {
    FarmsTable,
  },
};
</script>
