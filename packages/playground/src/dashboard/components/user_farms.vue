<template v-if="farms">
  <div class="my-6">
    <v-text-field
      class="mb-6"
      v-model="search"
      label="Search farm by ID or farm name"
      single-line
      hide-details
    ></v-text-field>
    <v-alert type="warning" variant="tonal" v-if="farmsCount == 0" class="my-8">
      Can't see any of your farms? Try changing your key type in your TFChain Wallet above.
    </v-alert>
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
          <v-toolbar-title class="mb-6 text-subtitle-1 text-center">Your Farms</v-toolbar-title>
        </v-toolbar>
      </template>
      <template v-slot:expanded-row="{ columns, item }">
        <tr>
          <td
            class="border border-anchor px-8 py-4"
            :style="{ backgroundColor: 'rgb(var(--v-theme-background))' }"
            :colspan="columns.length"
          >
            <v-row>
              <v-col cols="12" class="mt-4">
                <card-details :loading="false" title="Farm Details" :items="getFarmDetails(item.raw)"></card-details>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12 my-2">
                <PublicIPsTable :farmId="item.raw.farmId" :refreshPublicIPs="refreshPublicIPs" />
                <v-card-actions>
                  <v-row class="justify-center mt-3">
                    <v-btn
                      class="text-subtitle-1 px-6"
                      color="secondary"
                      variant="outlined"
                      @click="showDialogue = true"
                    >
                      Add/Edit Stellar Payout Address
                    </v-btn>
                    <v-btn
                      class="text-subtitle-1 px-6"
                      v-if="network == 'main'"
                      color="secondary"
                      variant="outlined"
                      @click="downloadFarmReceipts(item.value.farmId)"
                    >
                      Download Minting Receipts
                    </v-btn>
                    <AddIP v-model:farmId="item.raw.farmId" @ip-added-successfully="handleIpAdded" />
                  </v-row>
                </v-card-actions>
              </v-col>
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
                <v-btn @click="showDialogue = false" variant="outlined" color="anchor">Close</v-btn>
                <v-btn
                  color="secondary"
                  variant="outlined"
                  @click="setStellarAddress(item.raw.farmId, address)"
                  :loading="isAdding"
                  :disabled="!valid || isAdding"
                  >Submit</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import type { Farm } from "@threefold/gridproxy_client";
import { jsPDF } from "jspdf";
import { debounce } from "lodash";
import { StrKey } from "stellar-sdk";
import { ref } from "vue";

import { gridProxyClient } from "@/clients";
import CardDetails from "@/components/node_details_cards/card_details.vue";
import { useGrid, useProfileManager } from "@/stores";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
import {
  generateNodeSummary,
  generateReceipt,
  getNodeAvailability,
  getNodeMintingFixupReceipts,
  type NodeInterface,
} from "@/utils/node";

import AddIP from "./add_ip.vue";
import PublicIPsTable from "./public_ips_table.vue";

export default {
  name: "UserFarms",
  components: {
    PublicIPsTable,
    CardDetails,
    AddIP,
  },
  setup(_, context) {
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
    const farms = ref<Farm[]>();
    const farmsCount = ref();
    const showDialogue = ref(false);
    const valid = ref(false);
    const address = ref();
    const isValidAddress = ref(false);
    const isAdding = ref(false);
    const network = process.env.NETWORK || (window as any).env.NETWORK;
    const refreshPublicIPs = ref(false);

    const reloadFarms = debounce(getUserFarms, 20000);
    context.expose({ reloadFarms });
    function filter(items: Farm[]) {
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
        const { data, count } = await gridProxyClient.farms.list({
          retCount: true,
          twinId,
          page: page.value,
          size: pageSize.value,
        });

        const filteredFarms = filter(data);
        farms.value = filteredFarms as unknown as Farm[];
        farmsCount.value = count || filteredFarms.length;
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
        createCustomToast("Table may take sometime to update the changes.", ToastType.info);
        await reloadFarms();
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
        { name: "Dedicated", value: item.dedicated ? "Yes" : "No" },
        { name: "Pricing Policy", value: item.pricingPolicyId },
      ];
    }

    async function downloadFarmReceipts(farmId: number) {
      // farm summary receipt
      const docSum = new jsPDF();
      const { data, count } = await gridProxyClient.nodes.list({
        farmIds: farmId.toString(),
        retCount: true,
      });

      // show toast & return if farm has no nodes
      if (count === 0) {
        createCustomToast("Farm has no nodes.", ToastType.info);
        return;
      }
      const _nodes = data as unknown as NodeInterface[];
      const nodesWithReceipts = _nodes.map(async (node: NodeInterface) => {
        try {
          node.receipts = [];
          node.receipts = await getNodeMintingFixupReceipts(node.nodeId);
          node.availability = await getNodeAvailability(node.nodeId);
          console.log("node.availability", node.availability);
        } catch (error) {
          createCustomToast(`Couldn't download farm reciepts. ${error}`, ToastType.danger);
        }

        return node;
      });
      const nodes = await Promise.all(nodesWithReceipts);
      generateNodeSummary(docSum, nodes);
      docSum.addPage();

      // each node receipt
      nodes.map((node: any, i: number) => {
        generateReceipt(docSum, node);
        docSum.text(`${i + 1}`, 185, docSum.internal.pageSize.height - 10);
        docSum.addPage();
      });

      // download the full receipts
      docSum.save(`farm_${farmId}_receipt.pdf`);
    }

    function handleIpAdded() {
      refreshPublicIPs.value = !refreshPublicIPs.value;
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
      network,
      getUserFarms,
      setStellarAddress,
      customStellarValidation,
      getFarmDetails,
      downloadFarmReceipts,
      handleIpAdded,
      refreshPublicIPs,
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
