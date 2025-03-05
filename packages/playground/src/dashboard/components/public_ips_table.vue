<template>
  <div>
    <v-data-table-server
      v-model="selectedItems"
      :headers="headers"
      :items="publicIps"
      :items-length="publicIpsCount"
      :loading="loading"
      v-model:items-per-page="pageSize"
      @update:options="getFarmPublicIp"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
      ]"
      v-model:page="page"
      no-data-text="No IPs added on this farm"
      :deleting="isRemoving"
      show-select
      return-object
    >
      <template v-slot:top>
        <v-alert>
          <h4 class="text-center font-weight-medium">Public IPs</h4>
        </v-alert>
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.ip || "-" }}
      </template>
      <template #[`item.gateway`]="{ item }">
        {{ item.gateway || "-" }}
      </template>

      <template #[`item.contractId`]="{ item }">
        {{ item.contract_id ?? "-" }}
      </template>
    </v-data-table-server>

    <div v-if="publicIps.length > 0" class="d-flex align-end justify-end">
      <v-btn class="my-3" color="error" prepend-icon="mdi-delete" @click="showDialogue = true"> Delete </v-btn>
    </div>
    <v-dialog v-model="showDialogue" max-width="600" attach="#modals">
      <v-card>
        <v-card-title class="bg-primary text-subtitle-1">
          <strong>Delete the following IPs?</strong>
        </v-card-title>
        <v-card-text>
          <v-chip class="mb-5 mr-2" v-for="item in selectedItems" :key="item">
            {{ item.ip }}
          </v-chip>
          <v-divider />
        </v-card-text>
        <v-card-actions class="justify-end mb-1 mr-2">
          <v-btn @click="showDialogue = false" color="anchor">Close</v-btn>
          <v-btn
            text="Delete"
            :loading="isRemoving"
            color="error"
            :disabled="isRemoving"
            @click="removeFarmIps"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import type { RemoveFarmIPModel } from "@threefold/grid_client";
import type { PublicIp } from "@threefold/gridproxy_client";
import { ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import { useGrid } from "@/stores";
import { IPType } from "@/utils/types";

import { createCustomToast, ToastType } from "../../utils/custom_toast";
export default {
  name: "PublicIPsTable",
  props: {
    farmId: {
      type: Number,
      required: true,
    },
    refreshPublicIPs: Boolean,
  },
  setup(props) {
    const gridStore = useGrid();
    const headers = [
      {
        title: "IP",
        align: "center",
        key: "ip",
        sortable: false,
      },
      {
        title: "Gateway",
        align: "center",
        key: "gateway",
        sortable: false,
      },
      {
        title: "Deployed Contract ID",
        align: "center",
        key: "contractId",
      },
    ] as any;
    const publicIps = ref<PublicIp[]>([]);
    const publicIpsCount = ref();
    const loading = ref(false);
    const loadingIps = ref(false);
    const showDialogue = ref(false);
    const type = ref(IPType.single);
    const publicIP = ref();
    const toPublicIP = ref();
    const gateway = ref();
    const isRemoving = ref(false);
    const selectedItems = ref<any[]>([]);
    const items = ref<RemoveFarmIPModel[]>([]);
    const page = ref<number>(1);
    const pageSize = ref(10);

    async function getFarmPublicIp() {
      loadingIps.value = true;
      try {
        const { data, count } = await gridProxyClient.publicIps.list({
          retCount: true,
          page: page.value,
          size: pageSize.value,
          free: true,
          farmIds: props.farmId,
        });
        publicIps.value = data as PublicIp[];
        publicIpsCount.value = count || publicIps.value.length;
      } catch (error) {
        createCustomToast(`Failed to get public IPs! ${error}`, ToastType.danger);
      } finally {
        loadingIps.value = false;
      }
    }

    async function removeFarmIps() {
      try {
        isRemoving.value = true;
        items.value = selectedItems.value.map(item => ({
          ip: item.ip,
          farmId: props.farmId,
        }));
        await gridStore.grid.farms.removeFarmIps(items.value);
        createCustomToast("IP is deleted successfully!", ToastType.success);
        await getFarmPublicIp();
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to delete IP!", ToastType.danger);
      } finally {
        isRemoving.value = false;
        showDialogue.value = false;
        selectedItems.value = [];
      }
    }
    watch(
      () => props.refreshPublicIPs,
      () => {
        getFarmPublicIp();
      },
      { deep: true },
    );

    return {
      gridStore,
      headers,
      publicIps,
      type,
      publicIP,
      toPublicIP,
      gateway,
      loading,
      showDialogue,
      isRemoving,
      removeFarmIps,
      selectedItems,
      loadingIps,
      getFarmPublicIp,
      pageSize,
      page,
      publicIpsCount,
    };
  },
};
</script>
