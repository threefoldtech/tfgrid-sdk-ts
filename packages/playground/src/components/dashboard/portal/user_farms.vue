<template v-if="farms">
  <div class="my-6">
    <v-text-field class="mb-6" v-model="search" label="Search Farm" single-line hide-details></v-text-field>
    <v-data-table
      :headers="headers"
      :items="farms"
      :search="search"
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
            <v-row class="d-flex justify-space-between">
              <v-col cols="8" class="my-4">
                <span> Stellar Address: </span>
                <span> {{ item.stellarAddress || "-" }} </span>
              </v-col>
              <v-col cols="4" class="my-4">
                <span> Pricing Policy: </span>
                <span> {{ item.pricingPolicyId || "-" }} </span>
              </v-col>
            </v-row>
            <PublicIPsTable :farmId="item.farmId" />
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
                  @click="setStellarAddress(item.farmId, address)"
                  :disabled="!valid"
                  >Submit</v-btn
                >
                <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import type { FarmInfo } from "@threefold/grid_client";
import { StrKey } from "stellar-sdk";
import { onMounted, ref } from "vue";

import { useGrid, useProfileManager } from "../../../stores";
import { createCustomToast, ToastType } from "../../../utils/custom_toast";
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
    const showDialogue = ref(false);
    const valid = ref(false);
    const address = ref();
    const isValidAddress = ref(false);

    onMounted(async () => {
      await getUserFarms();
    });

    async function getUserFarms() {
      try {
        const userFarms = await gridStore.grid.capacity.getUserFarms({ twinId });
        farms.value = userFarms;
        return userFarms;
      } catch (error) {
        console.log(error);
      }
    }

    async function setStellarAddress(farmId: number, stellarAddress: string) {
      try {
        await gridStore.grid.farms.addStellarAddress({ farmId, stellarAddress });
        createCustomToast("Address Added successfully!", ToastType.success);
        showDialogue.value = false;
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to add address!", ToastType.danger);
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

    return {
      gridStore,
      headers,
      farms,
      expanded,
      search,
      showDialogue,
      address,
      valid,
      isValidAddress,
      getUserFarms,
      setStellarAddress,
      customStellarValidation,
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
