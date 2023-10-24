<template v-if="farms">
  <div class="my-6">
    <v-text-field
      class="mb-6"
      v-model="search"
      label="Search farm by ID or farm name"
      single-line
      hide-details
    ></v-text-field>
    <v-data-table-server
      :loading="loading"
      :items-length="farmsCount"
      :search="search"
      :headers="headers"
      :items="farms"
      v-model:items-per-page="pageSize"
      v-model:page="page"
      show-expand
      :expanded="expanded"
      @update:expanded="
        $event => {
          if ($event.length > 0) {
            expanded = [$event.pop()];
          } else {
            expanded = [];
          }
        }
      "
      expand-on-click
      @update:options="getUserFarms"
      :hover="true"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
        { value: 50, title: '50' },
      ]"
      return-object
    >
      <template v-slot:top>
        <v-toolbar flat color="primary">
          <v-toolbar-title class="mb-6 text-subtitle-1">Your Farms</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length">
            <v-row>
              <v-col cols="12" class="mt-4">
                <card-details
                  :loading="false"
                  title="Farm Details"
                  icon="mdi-silo"
                  :items="getFarmDetails(item.raw)"
                ></card-details>
              </v-col>
            </v-row>
            <PublicIPsTable :farmId="item.raw.farmId" />
            <v-row class="d-flex justify-center pb-5">
              <v-card-actions>
                <v-btn class="bg-primary" v-bind:href="'https://v3.bootstrap.grid.tf/'" target="blank"
                  >Bootstrap Node Image</v-btn
                >
                <v-btn class="bg-primary" @click="showDialogue = true">Add/Edit Stellar Payout Address</v-btn>
              </v-card-actions>
            </v-row>
          </td>
        </tr>

        <v-container v-if="showDialogue">
          <v-dialog v-model="showDialogue" max-width="600">
            <v-card>
              <v-toolbar color="primary" dark>
                <v-toolbar-title class="custom-toolbar_title mb-6"> Add/Edit Stellar V2 Address </v-toolbar-title>
              </v-toolbar>
              <div class="pt-6 px-6">
                <form-validator v-model="valid">
                  <input-validator
                    :value="address"
                    :rules="[validators.required('Address is required.'), customStellarValidation]"
                    #="{ props }"
                  >
                    <v-text-field
                      v-model="address"
                      v-bind="props"
                      outlined
                      label="Stellar Wallet Address"
                    ></v-text-field>
                  </input-validator>
                </form-validator>
              </div>
              <v-card-actions class="justify-end px-5 pb-5 pt-0">
                <v-btn
                  color="primary"
                  variant="tonal"
                  @click="setStellarAddress(item.raw.farmId, address)"
                  :loading="isAdding"
                  :disabled="!valid || isAdding"
                  >Submit</v-btn
                >
                <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import type { FarmInfo } from "@threefold/grid_client";
import { StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { gridProxyClient } from "@/clients";
import CardDetails from "@/explorer/components/node_details_cards/card_details.vue";

import { useGrid, useProfileManager } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";
import PublicIPsTable from "./public_ips_table.vue";

export default {
  name: "UserFarms",
  components: {
    PublicIPsTable,
    CardDetails,
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
        sortable: false,
      },
      {
        title: "Farm Name",
        align: "center",
        key: "name",
        sortable: false,
      },
      {
        title: "Linked Twin ID",
        align: "center",
        key: "twinId",
        sortable: false,
      },
      {
        title: "Certification Type",
        align: "center",
        key: "certificationType",
        sortable: false,
      },
    ] as any[];
    const loading = ref(false);
    const page = ref<number>(1);
    const pageSize = ref(10);
    const expanded = ref<any[]>();
    const farms = ref<FarmInfo[]>();
    const farmsCount = ref();
    const showDialogue = ref(false);
    const valid = ref(false);
    const address = ref();
    const isValidAddress = ref(false);
    const isAdding = ref(false);

    onMounted(async () => {
      await getUserFarms();
    });

    function fetch(items: FarmInfo[]) {
      const start = (page.value - 1) * pageSize.value;
      const end = start + pageSize.value;

      let filteredItems;
      if (search.value) {
        filteredItems = items.filter(
          item => item.name.toLowerCase().includes(search.value!.toLowerCase()) || item.farmId == +search.value!,
        );
      }

      const paginated = filteredItems ? filteredItems.slice(start, end) : items;

      return paginated;
    }

    async function getUserFarms() {
      try {
        const { data } = await gridProxyClient.farms.list({
          twinId,
          page: page.value,
          size: pageSize.value,
        });

        const filteredFarms = fetch(data);
        farms.value = filteredFarms as unknown as FarmInfo[];
        farmsCount.value = filteredFarms.length;
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to get user farms!", ToastType.danger);
      } finally {
        loading.value = false;
      }
    }

    async function setStellarAddress(farmId: number, stellarAddress: string) {
      try {
        isAdding.value = true;
        await gridStore.grid.farms.addStellarAddress({ farmId, stellarAddress });
        createCustomToast("Address Added successfully!", ToastType.success);
        showDialogue.value = false;
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to add address!", ToastType.danger);
      } finally {
        isAdding.value = false;
      }
    }

    function customStellarValidation() {
      isValidAddress.value = StrKey.isValidEd25519PublicKey(address.value);
      if (!isValidAddress.value) {
        return {
          message: "Address is not valid.",
        };
      }
      return undefined;
    }

    const copy = (address: string) => {
      navigator.clipboard.writeText(address);
      createCustomToast("Copied!", ToastType.success);
    };

    function getFarmDetails(item: any) {
      return [
        {
          name: "Stellar Address",
          value: item.stellarAddress || "-",
          icon: item.stellarAddress ? "mdi-content-copy" : undefined,
          callback: copy,
          hint: "Copy the stellar address to the clipboard.",
        },
        { name: "Dedicated", value: item.dedicated },
        { name: "Pricing Policy", value: item.pricingPolicyId },
      ];
    }

    return {
      gridStore,
      headers,
      farms,
      loading,
      page,
      pageSize,
      expanded,
      search,
      showDialogue,
      address,
      valid,
      isValidAddress,
      isAdding,
      farmsCount,
      getUserFarms,
      setStellarAddress,
      customStellarValidation,
      getFarmDetails,
    };
  },
};
</script>
<style scoped>
.v-toolbar {
  height: 2.5rem !important;
}

.custom-toolbar_title {
  font-size: 1rem !important;
}
</style>
