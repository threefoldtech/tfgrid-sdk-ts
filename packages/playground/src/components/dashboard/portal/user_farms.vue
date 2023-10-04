<template v-if="farms">
  <div class="my-6">
    <v-text-field class="mb-6" v-model="search" label="Search Farm" single-line hide-details></v-text-field>
    <v-data-table
      :headers="headers"
      :items="farms"
      :search="search"
      single-expand="true"
      :expanded.sync="expanded"
      show-expand
      item-value="name"
    >
      <template v-slot:top>
        <v-toolbar flat color="primary">
          <v-toolbar-title class="mb-6 text-subtitle-1">Your Farms</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-row no-gutters>
              <v-col class="d-flex">
                <v-sheet class="pa-2 ma-2"> Stellar Address: </v-sheet>
                <v-sheet class="pa-2 ma-2"> {{ item.raw.stellarAddress || "-" }} </v-sheet>
              </v-col>
              <v-col class="d-flex">
                <v-sheet class="pa-2 ma-2"> Pricing Policy: </v-sheet>
                <v-sheet class="pa-2 ma-2"> {{ item.raw.pricingPolicyId || "-" }} </v-sheet>
              </v-col>
            </v-row>
            <PublicIPsTable :farmId="item.columns.farmId" />
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import type { FarmInfo } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useGrid, useProfileManager } from "../../../stores";
import PublicIPsTable from "./public_ips_table.vue";

export default {
  name: "UserFarms",
  components: {
    PublicIPsTable,
  },
  setup() {
    const gridStore = useGrid();
    const profile = useProfileManager().profile;
    const twinId = profile!.twinId;
    const search = ref<string>();
    const headers = [
      {
        title: "Farm ID",
        align: "center",
        key: "farmId",
      },
      {
        title: "Farm Name",
        align: "center",
        key: "name",
      },
      {
        title: "Linked Twin ID",
        align: "center",
        key: "twinId",
      },
      {
        title: "Certification Type",
        align: "center",
        key: "certificationType",
      },
      // {
      //   title: "Pricing Policy ID",
      //   align: "center",
      //   key: "pricingPolicyId",
      // },
      // {
      //   title: "Stellar Address",
      //   align: "center",
      //   key: "stellarAddress",
      // },
    ] as any[];
    const expanded = ref<any[]>();
    const farms = ref<FarmInfo[]>();

    onMounted(async () => {
      await getUserFarms();
    });

    function customSearch(search: string, item: any) {
      // Define the columns you want to filter by
      const columnsToFilter = ["farmId", "name"];

      // Loop through the columns and check if the search term matches any of them
      for (const column of columnsToFilter) {
        const cellValue = item[column].toString().toLowerCase();
        if (cellValue.includes(search.toLowerCase())) {
          return true; // Include the item in the filtered results
        }
      }

      return false; // Exclude the item from the filtered results
    }

    async function getUserFarms() {
      try {
        const userFarms = await gridStore.grid.capacity.getUserFarms({ twinId });
        console.log("userFarms", userFarms);

        farms.value = userFarms;
        return userFarms;
      } catch (error) {
        console.log(error);
      }
    }

    async function setStellarAddress(farmId: number, stellarAddress: string) {
      try {
        return await gridStore.grid.farms.addStellarAddress({ farmId, stellarAddress });
      } catch (error) {
        console.log(error);
      }
    }

    return {
      gridStore,
      headers,
      farms,
      expanded,
      search,
      customSearch,
      getUserFarms,
      setStellarAddress,
    };
  },
};
</script>
<style scoped>
.v-toolbar {
  height: 2.5rem !important;
}
</style>
