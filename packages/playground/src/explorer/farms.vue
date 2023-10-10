<template>
  <!-- filter -->
  <view-layout>
    <v-row>
      <v-col>
        <!-- table -->
        <div class="hint mb-2">
          <v-alert type="info" variant="tonal">
            The farms will be filtered and displayed after you enter the value by 1 second.
          </v-alert>
        </div>
        <FarmsTable v-model="farms" :count="farmsCount" :loading="loading" />
      </v-col>
    </v-row>
    <!-- details -->
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";

import { getFarms } from "./utils/helpers";

const loading = ref<boolean>(true);
// const isFormLoading = ref<boolean>(true);
const farms = ref<Farm[]>([]);
const farmsCount = ref<number>(0);

const getAllFarms = async () => {
  loading.value = true;
  try {
    const { data } = await getFarms();
    farms.value = data;
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
