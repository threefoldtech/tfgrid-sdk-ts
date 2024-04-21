<template>
  <div>
    <v-data-table
      :loading="loadingIps"
      loading-text="Loading farm IPs..."
      :headers="headers"
      :items="copyPublicIps"
      :items-length="publicIps.length"
      :items-per-page="size"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: 15, title: '15' },
        { value: 20, title: '20' },
        { value: 50, title: '50' },
      ]"
      :page="page"
      @update:items-per-page="size => updateIPPageSize(size)"
      @update:page="page => updateIPPage(page)"
      class="elevation-1 v-data-table-header"
      :disable-sort="true"
      hide-default-header
      :hover="true"
      show-select
      v-model="itemsToDelete"
      :deleting="deleting"
    >
      <template v-slot:top>
        <v-alert class="pa-5" style="height: 20px">
          <h4 class="text-center font-weight-medium">Public IPs</h4>
        </v-alert>
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.value.ip || "-" }}
      </template>
      <template #[`item.gateway`]="{ item }">
        {{ item.value.gateway || "-" }}
      </template>

      <template #[`item.contract_id`]="{ item }">
        {{ item.value.contract_id || "-" }}
      </template>
      <template #bottom>
        <div class="d-flex align-end justify-end">
          <v-btn
            class="ma-5"
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            :disabled="itemsToDelete.length === 0 || deleting"
            @click="showDialogue = true"
          >
            Delete
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="showDialogue" max-width="600">
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">Delete IP</p>
        </v-toolbar>
        <v-card-title class="text-subtitle-1">
          <strong>Delete the following IPs?</strong>
        </v-card-title>
        <v-card-text>
          <v-chip class="ma-1" color="primary" v-for="item in itemsToDelete" :key="item.deploymentName">
            {{ item.ip }}
          </v-chip>
        </v-card-text>
        <v-card-actions class="justify-end px-5 pb-5 pt-0">
          <v-btn @click="showDialogue = false" variant="outlined" color="anchor">Close</v-btn>
          <v-btn
            variant="outlined"
            text="Confirm"
            color="error"
            :loading="isRemoving"
            :disabled="isRemoving"
            @click="removeFarmIp()"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import type { PublicIp } from "@threefold/tfchain_client";
import { onMounted, ref, watch } from "vue";

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
    const copyPublicIps = ref<PublicIp[]>([]);
    const loading = ref(false);
    const loadingIps = ref(false);
    const showDialogue = ref(false);
    const type = ref(IPType.single);
    const publicIP = ref();
    const toPublicIP = ref();
    const gateway = ref();
    const isRemoving = ref(false);
    const size = ref(5);
    const page = ref(1);
    const itemsToDelete = ref<any[]>([]);
    const deleting = ref(false);

    onMounted(async () => {
      await getFarmByID(props.farmId);
    });

    function updateIPPageSize(pageSize: number) {
      loadingIps.value = true;
      size.value = pageSize;
      copyPublicIps.value = publicIps.value.slice(0, size.value) as unknown as PublicIp[];
      loadingIps.value = false;
    }
    function updateIPPage(pageNumber: number) {
      page.value = pageNumber;
      loadingIps.value = true;
      const startIndex = (pageNumber - 1) * size.value;
      const endIndex = startIndex + size.value;
      copyPublicIps.value = publicIps.value.slice(startIndex, endIndex) as unknown as PublicIp[];
      loadingIps.value = false;
    }

    async function getFarmByID(id: number) {
      loadingIps.value = true;
      try {
        const farm = await gridStore.grid.farms.getFarmByID({ id });
        publicIps.value = farm.publicIps as unknown as PublicIp[];
        copyPublicIps.value = publicIps.value.slice(0, size.value);
      } catch (error) {
        createCustomToast(`Failed to get public IPs! ${error}`, ToastType.danger);
      }
      loadingIps.value = false;
    }
    async function removeFarmIp() {
      try {
        isRemoving.value = true;
        for (const item of itemsToDelete.value) {
          await gridStore.grid.farms.removeFarmIp({
            ip: item.ip,
            farmId: props.farmId,
          });
          createCustomToast("IP is deleted successfully!", ToastType.success);
          await getFarmByID(props.farmId);
        }
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to delete IP!", ToastType.danger);
      } finally {
        isRemoving.value = false;
        showDialogue.value = false;
        itemsToDelete.value = [];
      }
    }
    watch(
      () => props.refreshPublicIPs,
      () => {
        getFarmByID(props.farmId);
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
      itemsToDelete,
      removeFarmIp,
      page,
      size,
      updateIPPage,
      copyPublicIps,
      loadingIps,
      updateIPPageSize,
      deleting,
    };
  },
};
</script>
<style scoped>
.custom-toolbar {
  height: 2.5rem !important;
  padding-left: 10px;
}
</style>
