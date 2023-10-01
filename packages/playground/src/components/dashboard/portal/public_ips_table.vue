<template v-if="publicIps">
  <div class="my-6">
    <v-data-table :headers="headers" :items="publicIps" item-value="name" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat color="transparent">
          <v-toolbar-title class="text-subtitle-1 font-weight-bold py-3">Public IPs</v-toolbar-title>
        </v-toolbar>
      </template>
      <template #bottom></template>
    </v-data-table>
  </div>
</template>
<script lang="ts">
import { onMounted, ref } from "vue";

import { useGrid } from "@/stores";

export default {
  name: "PublicIPsTable",
  props: ["farmId"],
  setup(props) {
    const gridStore = useGrid().grid;
    const headers = [
      {
        title: "IP",
        align: "center",
        key: "ip",
      },
      {
        title: "Gateway",
        align: "center",
        key: "gateway",
      },
      {
        title: "Deployed Contract ID",
        align: "center",
        key: "contract_id",
      },
    ] as any;
    const publicIps = ref();
    onMounted(async () => {
      await getFarmByID(props.farmId);
    });
    async function getFarmByID(id: number) {
      try {
        const farm = await gridStore.farms.getFarmByID({ id });
        publicIps.value = farm.publicIps;
      } catch (error) {
        console.log(error);
      }
    }
    return {
      gridStore,
      headers,
      publicIps,
    };
  },
};
</script>
<style scoped>
.v-toolbar {
  max-height: 3rem;
}
</style>
