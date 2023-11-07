<template>
  <div class="my-6">
    <AddIP
      v-model:farmId="$props.farmId"
      v-model:type="type"
      v-model:publicIP="publicIP"
      v-model:toPublicIP="toPublicIP"
      v-model:gateway="gateway"
      @add-publicIPs="publicIps.push(...$event)"
    />
    <v-data-table v-if="publicIps?.length > 0" :headers="headers" :items="publicIps" class="elevation-1">
      <template v-slot:top>
        <p class="text-subtitle-1 font-weight-bold pa-4 ma-4 w-50">Public IPs</p>
      </template>
      <template #[`item.ip`]="{ item }">
        {{ item.raw.ip || "-" }}
      </template>

      <template #[`item.gateway`]="{ item }">
        {{ item.raw.gateway || "-" }}
      </template>

      <template #[`item.contract_id`]="{ item }">
        {{ item.raw.contract_id || "-" }}
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn
          color="red-darken-1"
          @click="
            () => {
              showDialogue = true;
              itemToDelete = item.raw;
            }
          "
          :disabled="loading"
          :loading="loading"
        >
          Delete IP
        </v-btn>
      </template>
      <template #bottom></template>
    </v-data-table>
    <v-dialog v-model="showDialogue" max-width="600">
      <v-card>
        <v-toolbar color="primary" class="custom-toolbar">
          <p class="mb-5">Delete IP</p>
        </v-toolbar>
        <v-card-text> Are you sure you want to delete IP {{ itemToDelete.ip }}? </v-card-text>
        <v-card-actions class="justify-end px-5 pb-5 pt-0">
          <v-btn
            text="Delete"
            color="white"
            :loading="isRemoving"
            :disabled="isRemoving"
            class="bg-red-lighten-1"
            @click="removeFarmIp({ farmId: $props.farmId, ip: itemToDelete.ip }, index)"
          ></v-btn>
          <v-btn @click="showDialogue = false" class="grey lighten-2 black--text">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import type { RemoveFarmIPModel } from "@threefold/grid_client";
import { onMounted, ref } from "vue";

import { useGrid } from "@/stores";
import { IPType } from "@/utils/types";

import { createCustomToast, ToastType } from "../../../utils/custom_toast";
import AddIP from "./add_ip.vue";

export default {
  name: "PublicIPsTable",
  props: {
    farmId: {
      type: Number,
      required: true,
    },
  },
  components: {
    AddIP,
  },
  setup(props) {
    const gridStore = useGrid();
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
      { title: "Actions", align: "center", sortable: false, key: "actions" },
    ] as any;
    const publicIps = ref();
    const loading = ref(false);
    const showDialogue = ref(false);
    const type = ref(IPType.single);
    const publicIP = ref();
    const toPublicIP = ref();
    const gateway = ref();
    const isRemoving = ref(false);
    const itemToDelete = ref();

    onMounted(async () => {
      await getFarmByID(props.farmId);
    });
    async function getFarmByID(id: number) {
      try {
        const farm = await gridStore.grid.farms.getFarmByID({ id });
        publicIps.value = farm.publicIps;
      } catch (error) {
        createCustomToast(`Failed to get public IPs! ${error}`, ToastType.danger);
      }
    }
    async function removeFarmIp(options: RemoveFarmIPModel, index: number) {
      try {
        isRemoving.value = true;
        await gridStore.grid.farms.removeFarmIp({ ip: options.ip, farmId: options.farmId });
        createCustomToast("IP is deleted successfully!", ToastType.success);
        showDialogue.value = false;
        publicIps.value.splice(index, 1);
      } catch (error) {
        console.log(error);
        createCustomToast("Failed to delete IP!", ToastType.danger);
      } finally {
        isRemoving.value = false;
      }
    }
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
      itemToDelete,
      removeFarmIp,
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
