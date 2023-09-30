<template>
  <div class="my-6">
    <v-card color="primary rounded-b-0">
      <v-card-title class="py-1 text-subtitle-1 font-weight-bold">Your Farms</v-card-title>
    </v-card>
    <v-data-table
      v-if="farms"
      :headers="headers"
      :items="farms"
      single-expand="true"
      show-expand
      :expanded.sync="expanded"
      item-value="name"
    >
      <template v-slot:expanded-item="{ item }">
        <tr>
          <td>
            {{ item.name }}
            nenenenenenene
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

export default {
  name: "UserFarms",
  setup() {
    const gridStore = useGrid();
    const profileManager = useProfileManager();
    const twinId = profileManager.profile!.twinId;
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
      console.log("expanded", expanded.value);
    });

    async function createFarm(name: string) {
      console.log("grid", gridStore.grid);
      try {
        return await gridStore.grid.farms.create({ name });
      } catch (error) {
        console.log(error);
      }
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

    async function addFarmIp(farmId: number, ip: number, gw: number) {
      try {
        return await gridStore.grid.farms.addFarmIp({ farmId, ip, gw });
      } catch (error) {
        console.log(error);
      }
    }

    async function removeFarmIp(farmId: number, ip: number) {
      try {
        return await gridStore.grid.farms.removeFarmIp({ farmId, ip });
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
      createFarm,
      getUserFarms,
      addFarmIp,
      removeFarmIp,
      setStellarAddress,
    };
  },
};
</script>
